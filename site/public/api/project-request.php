<?php
/**
 * ByteAndBook — Project Request submission endpoint (V2-3).
 *
 * Accepts a JSON POST from the Start Project modal, validates it
 * server-side (independent of the client-side checks in
 * StartProjectModal.astro — never trust the client), and emails the
 * result to info@byteandbook.com via PHP mail(). Returns a small JSON
 * envelope the frontend uses to show a real success/error state.
 *
 * Deployment: this file lives in the Astro `public/` tree, so
 * `npm run build` copies it verbatim to `dist/api/project-request.php`
 * — uploading `dist/` (as every prior phase already does) puts it at
 * https://byteandbook.com/api/project-request.php with no extra step.
 *
 * No secrets are required for this file to work: it sends mail via the
 * server's local sendmail transport (confirmed available on the
 * Namecheap account during V2-3's SSH capability check), not SMTP, so
 * there is nothing here to keep out of git except this comment's
 * reminder to keep it that way.
 */

declare(strict_types=1);

// Never leak internals to the client — errors are logged server-side
// (technical message only, no submitted personal data) and reported to
// the client as a generic JSON error.
error_reporting(E_ALL);
ini_set('display_errors', '0');

set_exception_handler(static function (Throwable $e): void {
    error_log('[ByteAndBook] project-request uncaught: ' . $e->getMessage());
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode(['ok' => false, 'error' => 'Unexpected server error. Please try again or email info@byteandbook.com directly.']);
    exit;
});

register_shutdown_function(static function (): void {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        error_log('[ByteAndBook] project-request fatal: ' . $error['message']);
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['ok' => false, 'error' => 'Unexpected server error. Please try again or email info@byteandbook.com directly.']);
        }
    }
});

// ---------------------------------------------------------------------
// Config — keep in sync with the frontend's single sources of truth.
// ---------------------------------------------------------------------

// Mirrors src/lib/legal.ts. The server is authoritative: whatever the
// client submits is validated for presence/acceptance only, never used
// in place of this value in the email record.
const TERMS_VERSION = '2026-08-v2';

const RECIPIENT_EMAIL = 'info@byteandbook.com';

// Mirrors the `services` content collection ids (site/src/content/services/*.md).
const KNOWN_SERVICES = [
    'digital-marketing' => 'Digital Marketing',
    'seo' => 'SEO',
    'geo' => 'GEO — Generative Engine Optimization',
    'social-media-marketing' => 'Social Media Marketing',
    'web-development' => 'Web Development',
    'software-development' => 'Software Development',
    'devops' => 'DevOps',
    'cloud' => 'Cloud Services',
    'computer-hardware' => 'Computer Hardware',
    'branding' => 'Branding & Logo Design',
    'ebook-publishing' => 'eBook & Digital Publishing',
];

// Mirrors StartProjectModal.astro's budgetOptions/timelineOptions/contactOptions.
const KNOWN_BUDGETS = [
    'Not sure yet', 'Under $500', '$500–$1,500', '$1,500–$5,000',
    '$5,000–$10,000', '$10,000+', 'Prefer to discuss',
];
const KNOWN_TIMELINES = [
    'As soon as possible', 'Within 2 weeks', 'Within 1 month',
    '1–3 months', '3+ months', 'Flexible / Not sure',
];
const KNOWN_CONTACT_METHODS = ['Email', 'WhatsApp', 'Phone Call'];

const ALLOWED_ORIGINS = [
    'https://byteandbook.com',
    'https://www.byteandbook.com',
];
// Local dev only — matched by pattern below, never affects production
// requests (an attacker cannot forge a browser-sent Origin header).
const ALLOWED_DEV_ORIGIN_PATTERN = '#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#i';

const RATE_LIMIT_MAX_REQUESTS = 5;   // per window, per client
const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minutes
const MAX_BODY_BYTES = 20_000; // generous for this form; blocks abuse

// ---------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------

function json_response(int $status, array $body): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(int $status, string $error, ?array $fieldErrors = null): never
{
    $body = ['ok' => false, 'error' => $error];
    if ($fieldErrors !== null && count($fieldErrors) > 0) {
        $body['errors'] = $fieldErrors;
    }
    json_response($status, $body);
}

/** Strips characters that could inject extra headers into mail(). */
function strip_header_injection(string $value): string
{
    return trim(str_replace(["\r", "\n", "\0"], '', $value));
}

/** As above, plus strips quotes so a name can't break out of a
 *  quoted-string header value (e.g. `Reply-To: "..." <addr>`). */
function sanitize_header_display_name(string $value): string
{
    return str_replace('"', '', strip_header_injection($value));
}

function generate_reference_id(): string
{
    // Unambiguous uppercase alphabet (no 0/O/1/I) — server-generated,
    // cryptographically random, never derived from client input.
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = '';
    for ($i = 0; $i < 6; $i++) {
        $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    return 'BB-' . date('Y') . '-' . $code;
}

function client_ip(): string
{
    // Shared hosting typically has no trusted proxy layer in front of
    // PHP for this account; REMOTE_ADDR is what's authoritative here.
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Minimal file-based rate limiter. Stores only a rolling list of
 * request timestamps per hashed IP — no personal data, no submission
 * content. Fails open (allows the request) if the storage directory
 * can't be prepared, so an infra hiccup never blocks legitimate users;
 * it's a hardening layer, not the primary defense.
 */
function rate_limit_check(): void
{
    $docRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__)), '/\\');
    $candidates = [
        dirname($docRoot) . '/byteandbook_data/rate_limit',
        rtrim(sys_get_temp_dir(), '/\\') . '/byteandbook_rate_limit',
    ];

    $dir = null;
    foreach ($candidates as $candidate) {
        if (is_dir($candidate) && is_writable($candidate)) {
            $dir = $candidate;
            break;
        }
        if (!is_dir($candidate) && @mkdir($candidate, 0700, true)) {
            $dir = $candidate;
            break;
        }
    }
    if ($dir === null) {
        return; // fail open
    }

    $key = hash('sha256', client_ip() . '|byteandbook-rate-limit');
    $file = $dir . '/' . $key . '.json';

    $handle = @fopen($file, 'c+');
    if ($handle === false) {
        return; // fail open
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            return; // fail open
        }

        $raw = stream_get_contents($handle);
        $timestamps = is_string($raw) && $raw !== '' ? json_decode($raw, true) : [];
        if (!is_array($timestamps)) {
            $timestamps = [];
        }

        $now = time();
        $timestamps = array_values(array_filter(
            $timestamps,
            static fn($ts) => is_int($ts) && ($now - $ts) < RATE_LIMIT_WINDOW_SECONDS
        ));

        if (count($timestamps) >= RATE_LIMIT_MAX_REQUESTS) {
            fail(429, 'Too many requests. Please try again in a few minutes.');
        }

        $timestamps[] = $now;
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($timestamps));
        fflush($handle);
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function validate_origin(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
    if (is_string($origin) && $origin !== '') {
        if (in_array($origin, ALLOWED_ORIGINS, true) || preg_match(ALLOWED_DEV_ORIGIN_PATTERN, $origin)) {
            return;
        }
        fail(403, 'Request origin not allowed.');
    }

    // Fall back to Referer host when Origin is absent (some legitimate
    // same-origin requests omit it depending on browser/fetch mode).
    $referer = $_SERVER['HTTP_REFERER'] ?? null;
    if (is_string($referer) && $referer !== '') {
        $host = parse_url($referer, PHP_URL_HOST);
        $scheme = parse_url($referer, PHP_URL_SCHEME);
        $refererOrigin = $scheme && $host ? "$scheme://$host" . (parse_url($referer, PHP_URL_PORT) ? ':' . parse_url($referer, PHP_URL_PORT) : '') : '';
        if (in_array($refererOrigin, ALLOWED_ORIGINS, true) || preg_match(ALLOWED_DEV_ORIGIN_PATTERN, $refererOrigin)) {
            return;
        }
    }

    fail(403, 'Request origin not allowed.');
}

function send_cors_headers(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, ALLOWED_ORIGINS, true) || preg_match(ALLOWED_DEV_ORIGIN_PATTERN, $origin)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
    }
}

// ---------------------------------------------------------------------
// Request handling
// ---------------------------------------------------------------------

send_cors_headers();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // CORS preflight — no body needed either way.
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST, OPTIONS');
    fail(405, 'Method not allowed.');
}

validate_origin();

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== 0) {
    fail(415, 'Expected application/json.');
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > MAX_BODY_BYTES) {
    fail(413, 'Request body too large.');
}

$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
    fail(413, 'Request body too large.');
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    fail(400, 'Malformed request body.');
}

rate_limit_check();

// --- Honeypot -----------------------------------------------------------
// Hidden field real users never see/fill; a non-empty value means a bot
// filled every field on the page. Respond as if it succeeded (a fake,
// validly-formatted reference id) so the bot has no signal to adapt to,
// but never send mail or do further processing.
$honeypot = is_string($data['website'] ?? null) ? trim((string) $data['website']) : '';
if ($honeypot !== '') {
    json_response(200, ['ok' => true, 'referenceId' => generate_reference_id()]);
}

// --- Field extraction + validation --------------------------------------

$fullName = is_string($data['fullName'] ?? null) ? trim((string) $data['fullName']) : '';
$email = is_string($data['email'] ?? null) ? trim((string) $data['email']) : '';
$mobile = is_string($data['mobile'] ?? null) ? trim((string) $data['mobile']) : '';
$company = is_string($data['company'] ?? null) ? trim((string) $data['company']) : '';
$servicesInput = is_array($data['services'] ?? null) ? $data['services'] : [];
$otherService = is_string($data['otherService'] ?? null) ? trim((string) $data['otherService']) : '';
$description = is_string($data['description'] ?? null) ? trim((string) $data['description']) : '';
$budget = is_string($data['budget'] ?? null) ? trim((string) $data['budget']) : '';
$timeline = is_string($data['timeline'] ?? null) ? trim((string) $data['timeline']) : '';
$preferredContact = is_string($data['preferredContact'] ?? null) ? trim((string) $data['preferredContact']) : '';
$termsAccepted = ($data['termsAccepted'] ?? false) === true;
$privacyAcknowledged = ($data['privacyAcknowledged'] ?? false) === true;

$errors = [];

if ($fullName === '' || mb_strlen($fullName) > 120) {
    $errors['fullName'] = 'Please provide a valid full name.';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    $errors['email'] = 'Please provide a valid email address.';
}

if ($mobile === '' || !preg_match('/^[+0-9()\-\s]{7,24}$/', $mobile)) {
    $errors['mobile'] = 'Please provide a valid mobile or WhatsApp number, including your country code.';
}

if ($company !== '' && mb_strlen($company) > 160) {
    $errors['company'] = 'Company name is too long.';
}

$services = [];
foreach ($servicesInput as $value) {
    if (is_string($value) && ($value === 'other' || array_key_exists($value, KNOWN_SERVICES))) {
        $services[] = $value;
    }
}
$services = array_values(array_unique($services));

if (count($services) === 0) {
    $errors['services'] = 'Please select at least one service.';
}

$includesOther = in_array('other', $services, true);
if ($includesOther) {
    if ($otherService === '' || mb_strlen($otherService) > 160) {
        $errors['otherService'] = 'Please specify the service you need.';
    }
} else {
    $otherService = '';
}

if (mb_strlen($description) < 20 || mb_strlen($description) > 2000) {
    $errors['description'] = 'Please describe the project in 20–2000 characters.';
}

if ($budget !== '' && !in_array($budget, KNOWN_BUDGETS, true)) {
    $errors['budget'] = 'Invalid budget selection.';
}
if ($timeline !== '' && !in_array($timeline, KNOWN_TIMELINES, true)) {
    $errors['timeline'] = 'Invalid timeline selection.';
}
if ($preferredContact !== '' && !in_array($preferredContact, KNOWN_CONTACT_METHODS, true)) {
    $errors['preferredContact'] = 'Invalid contact-method selection.';
}

if (!$termsAccepted) {
    $errors['termsAccepted'] = 'You must agree to the Terms of Service and Refund & Cancellation Policy.';
}
if (!$privacyAcknowledged) {
    $errors['privacyAcknowledged'] = 'You must acknowledge the Privacy Policy.';
}

if (count($errors) > 0) {
    fail(422, 'Please correct the highlighted fields.', $errors);
}

// ---------------------------------------------------------------------
// Build + send the email
// ---------------------------------------------------------------------

$referenceId = generate_reference_id();
$submittedAt = new DateTime('now', new DateTimeZone('UTC'));
$submittedAtDisplay = $submittedAt->format('Y-m-d H:i:s') . ' UTC';

$serviceLines = array_map(
    static fn(string $id) => $id === 'other' ? 'Other' : KNOWN_SERVICES[$id],
    $services
);

$bodyLines = [
    "Reference ID: {$referenceId}",
    "Submitted: {$submittedAtDisplay}",
    '',
    "Full Name: {$fullName}",
    "Email: {$email}",
    "Mobile / WhatsApp: {$mobile}",
];
if ($company !== '') {
    $bodyLines[] = "Company / Brand: {$company}";
}
$bodyLines[] = '';
$bodyLines[] = 'Selected Services: ' . implode(', ', $serviceLines);
if ($includesOther) {
    $bodyLines[] = "Other Service: {$otherService}";
}
$bodyLines[] = '';
$bodyLines[] = 'Project Description:';
$bodyLines[] = $description;
$bodyLines[] = '';
$bodyLines[] = 'Budget: ' . ($budget !== '' ? $budget : 'Not provided');
$bodyLines[] = 'Timeline: ' . ($timeline !== '' ? $timeline : 'Not provided');
$bodyLines[] = 'Preferred Contact Method: ' . ($preferredContact !== '' ? $preferredContact : 'Not provided');
$bodyLines[] = '';
$bodyLines[] = 'Terms Accepted: Yes';
$bodyLines[] = 'Privacy Acknowledged: Yes';
$bodyLines[] = 'Terms Version: ' . TERMS_VERSION;

$body = implode("\n", $bodyLines);

$subject = strip_header_injection("New ByteAndBook Project Request — {$referenceId}");
$fromAddress = 'no-reply@byteandbook.com';
$replyToEmail = strip_header_injection($email);
$replyToName = sanitize_header_display_name($fullName);

$headers = [
    'From: ByteAndBook Website <' . $fromAddress . '>',
    'Reply-To: ' . ($replyToName !== '' ? "\"{$replyToName}\" <{$replyToEmail}>" : $replyToEmail),
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: ByteAndBook-ProjectRequest/1.0',
];

$sent = @mail(RECIPIENT_EMAIL, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    error_log('[ByteAndBook] project-request mail() failed for reference ' . $referenceId);
    fail(502, 'We could not send your request right now. Please email info@byteandbook.com directly.');
}

json_response(200, ['ok' => true, 'referenceId' => $referenceId]);
