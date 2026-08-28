#!/usr/bin/env node
// Phase 12 — lightweight, dependency-free QA check against the built
// `dist/` output. No test framework: plain regex/string checks against
// real HTML, run via `npm test`. Fails (non-zero exit) on any check
// that doesn't hold, printing every failure found rather than stopping
// at the first one.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');

const failures = [];
const fail = (msg) => failures.push(msg);
let checks = 0;
const check = (label, condition) => {
  checks++;
  if (!condition) fail(label);
};

if (!existsSync(DIST)) {
  console.error('dist/ does not exist — run `npm run build` first.');
  process.exit(1);
}

// ---- 1. Expected routes ----------------------------------------------
const SERVICE_SLUGS = [
  'digital-marketing', 'seo', 'geo', 'social-media-marketing',
  'web-development', 'software-development', 'devops', 'cloud',
  'computer-hardware', 'branding', 'ebook-publishing',
];

const indexablePages = {
  '/': 'index.html',
  '/about/': 'about/index.html',
  '/contact/': 'contact/index.html',
  '/services/': 'services/index.html',
  '/process/': 'process/index.html',
  // V2-4: /terms/, /privacy/, and /refund-policy/ got real published
  // content, replacing the V2-1 noindex placeholders — indexable like
  // any other professional-site legal page (see V2-4 report).
  '/terms/': 'terms/index.html',
  '/privacy/': 'privacy/index.html',
  '/refund-policy/': 'refund-policy/index.html',
  // V2-5: /work/ got real, substantial, permanent content (methodology,
  // evidence standards) independent of whether any case study exists
  // yet — indexable like any other professional-site page (see V2-5
  // report).
  '/work/': 'work/index.html',
  // V2-7: /insights/ got real, substantial, permanent content
  // (knowledge areas linking to real services, AI/GEO explanation,
  // evidence standards) independent of article count — indexable like
  // /work/ was in V2-5 (see V2-7 report).
  '/insights/': 'insights/index.html',
  ...Object.fromEntries(SERVICE_SLUGS.map((s) => [`/services/${s}/`, `services/${s}/index.html`])),
};
// Pages that stay noindex: internal reference (style-guide), and
// /checkout/ — a payment workflow page for people who already have an
// order reference, not a search landing page, so it stays out of the
// index/sitemap on purpose even though its V2-4 content is real (see
// V2-4 report).
const nonIndexablePages = {
  '/404.html': '404.html',
  '/style-guide/': 'style-guide/index.html',
  '/checkout/': 'checkout/index.html',
};
const allPages = { ...indexablePages, ...nonIndexablePages };

for (const [route, relPath] of Object.entries(allPages)) {
  check(`route exists: ${route} -> dist/${relPath}`, existsSync(join(DIST, relPath)));
}
check('exactly 24 known routes defined in this check', Object.keys(allPages).length === 24);

// ---- 2. Core static assets --------------------------------------------
check('styles.css exists', existsSync(join(DIST, 'styles.css')));
check('styles.css is non-empty', existsSync(join(DIST, 'styles.css')) && statSync(join(DIST, 'styles.css')).size > 1000);
check('robots.txt exists', existsSync(join(DIST, 'robots.txt')));
check('sitemap-index.xml exists', existsSync(join(DIST, 'sitemap-index.xml')));
const sitemapFiles = existsSync(DIST) ? readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f)) : [];
check('at least one sitemap-N.xml exists', sitemapFiles.length > 0);

// ---- helpers ------------------------------------------------------------
const readHtml = (relPath) => readFileSync(join(DIST, relPath), 'utf-8');
const jsonLdBlocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => m[1]);

function resolveHref(href, fromRoute) {
  if (/^(https?:|mailto:|tel:)/i.test(href)) return 'external';
  if (href.startsWith('#')) return 'anchor';
  let path = href.split('#')[0].split('?')[0];
  if (path === '') return 'self';
  if (!path.startsWith('/')) return 'relative-unexpected';
  if (path === '/') return existsSync(join(DIST, 'index.html')) ? 'ok' : 'missing';
  if (path === '/404.html') return existsSync(join(DIST, '404.html')) ? 'ok' : 'missing';
  if (path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.txt') || path.endsWith('.xml')) {
    return existsSync(join(DIST, path.slice(1))) ? 'ok' : 'missing';
  }
  const asDir = path.endsWith('/') ? path : path + '/';
  return existsSync(join(DIST, asDir.slice(1), 'index.html')) ? 'ok' : 'missing';
}

// ---- 3. Internal link + SEO + a11y checks, per page ----------------------
const titles = new Map();
const descriptions = new Map();

for (const [route, relPath] of Object.entries(allPages)) {
  if (!existsSync(join(DIST, relPath))) continue;
  const html = readHtml(relPath);
  const isIndexable = route in indexablePages;

  // --- internal links ---
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const href of hrefs) {
    const result = resolveHref(href, route);
    if (result === 'missing') fail(`${route}: broken internal link href="${href}"`);
    if (result === 'relative-unexpected') fail(`${route}: unexpected relative href="${href}" (should be absolute path)`);
  }

  // --- SEO metadata (Phase 9) ---
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  check(`${route}: canonical present`, !!canonical);
  if (canonical) check(`${route}: canonical is absolute https://byteandbook.com`, canonical[1].startsWith('https://byteandbook.com'));

  const title = html.match(/<title>([^<]*)<\/title>/);
  check(`${route}: <title> present`, !!title);
  if (title) titles.set(route, title[1]);

  const desc = html.match(/<meta name="description" content="([^"]*)"/);
  check(`${route}: meta description present`, !!desc);
  if (desc) descriptions.set(route, desc[1]);

  check(`${route}: og:title present`, /<meta property="og:title"/.test(html));
  check(`${route}: og:url present`, /<meta property="og:url"/.test(html));
  check(`${route}: twitter:card present`, /<meta name="twitter:card"/.test(html));

  const robotsMeta = html.match(/<meta name="robots" content="([^"]+)"/);
  check(`${route}: robots meta present`, !!robotsMeta);
  if (robotsMeta) {
    if (isIndexable) check(`${route}: robots = index,follow`, robotsMeta[1] === 'index, follow');
    else check(`${route}: robots = noindex,nofollow`, robotsMeta[1] === 'noindex, nofollow');
  }

  // JSON-LD validity + expected schema types
  const blocks = jsonLdBlocks(html);
  check(`${route}: has at least one JSON-LD block`, blocks.length > 0);
  const parsed = [];
  blocks.forEach((b, i) => {
    try { parsed.push(JSON.parse(b)); }
    catch (e) { fail(`${route}: JSON-LD block #${i} failed to parse (${e.message})`); }
  });
  const types = new Set();
  for (const p of parsed) {
    if (Array.isArray(p['@graph'])) p['@graph'].forEach((n) => types.add(n['@type']));
    else if (p['@type']) types.add(p['@type']);
  }
  check(`${route}: Organization schema present`, types.has('Organization'));
  check(`${route}: WebSite schema present`, types.has('WebSite'));
  if (route.startsWith('/services/') && route !== '/services/') {
    check(`${route}: Service schema present`, types.has('Service'));
    check(`${route}: BreadcrumbList schema present`, types.has('BreadcrumbList'));
  }
  if (['/services/', '/process/', '/terms/', '/privacy/', '/refund-policy/', '/work/', '/insights/'].includes(route)) {
    check(`${route}: BreadcrumbList schema present`, types.has('BreadcrumbList'));
  }
  if (route === '/checkout/') {
    // Explicitly NOT fabricated per the V2-4 brief: no LocalBusiness,
    // Review, AggregateRating, or payment-provider schema anywhere —
    // checked globally below, but asserted here too since /checkout/
    // is the page most tempting to over-decorate with fake trust
    // signals.
    check(`${route}: no fabricated Review/AggregateRating/LocalBusiness schema`, !types.has('Review') && !types.has('AggregateRating') && !types.has('LocalBusiness'));
  }
  if (route === '/') {
    check(`${route}: FAQPage schema present`, types.has('FAQPage'));
  }

  // --- accessibility (Phase 10) ---
  check(`${route}: skip-link present`, /class="skip-link"/.test(html));
  check(`${route}: main-content target with tabindex="-1"`, /id="main-content"\s+tabindex="-1"/.test(html));
  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  check(`${route}: exactly one <h1>`, h1Count === 1);
}

// robots.txt / sitemap content checks
const robotsTxt = readFileSync(join(DIST, 'robots.txt'), 'utf-8');
check('robots.txt references sitemap-index.xml', robotsTxt.includes('https://byteandbook.com/sitemap-index.xml'));
check('robots.txt disallows /style-guide/', robotsTxt.includes('Disallow: /style-guide/'));
check('robots.txt disallows /404.html', robotsTxt.includes('Disallow: /404.html'));
for (const route of Object.keys(nonIndexablePages).filter((r) => r.endsWith('/'))) {
  check(`robots.txt disallows ${route}`, robotsTxt.includes(`Disallow: ${route}`));
}
// Regression guard: these routes moved from noindex to indexable in
// V2-4/V2-5/V2-7 — make sure a future edit doesn't silently re-add them
// to Disallow.
for (const route of ['/terms/', '/privacy/', '/refund-policy/', '/work/', '/insights/']) {
  check(`robots.txt does NOT disallow ${route} (indexable)`, !robotsTxt.includes(`Disallow: ${route}`));
}

for (const f of sitemapFiles) {
  const xml = readFileSync(join(DIST, f), 'utf-8');
  check(`${f}: does not list /style-guide/`, !xml.includes('/style-guide/'));
  check(`${f}: does not list /404.html`, !xml.includes('/404.html'));
  for (const route of Object.keys(nonIndexablePages).filter((r) => r.endsWith('/'))) {
    check(`${f}: does not list ${route}`, !xml.includes(`>https://byteandbook.com${route}<`));
  }
}
const sitemapUrlCount = sitemapFiles.reduce(
  (n, f) => n + (readFileSync(join(DIST, f), 'utf-8').match(/<loc>/g) || []).length,
  0
);
check('sitemap contains exactly 21 indexable URLs', sitemapUrlCount === 21);

// duplicate title/description check across all pages
const titleValues = [...titles.values()];
const descValues = [...descriptions.values()];
check('no duplicate <title> across pages', new Set(titleValues).size === titleValues.length);
check('no duplicate meta description across pages', new Set(descValues).size === descValues.length);

// ---- 4. V2-2: Start Project modal + legacy-content guard ------------------
// The modal is rendered once in BaseLayout, so it (and its form fields)
// appear in every page's static HTML — checked here against the
// homepage as a representative page rather than repeating per route.
const homeHtml = readHtml('index.html');

check('start-project-modal: <dialog> present', /<dialog id="start-project-dialog"/.test(homeHtml));
check('start-project-modal: aria-labelledby present', /aria-labelledby="sp-title"/.test(homeHtml));
check('start-project-modal: aria-describedby present', /aria-describedby="sp-desc"/.test(homeHtml));

// Required-field attributes (QA items 12-16 of the V2-2 brief)
check('start-project-modal: fullName required', /name="fullName"[^>]*required/.test(homeHtml));
const emailTag = /<input[^>]*name="email"[^>]*>/.exec(homeHtml)?.[0] ?? '';
check('start-project-modal: email required', emailTag.includes('required'));
check('start-project-modal: email type=email', emailTag.includes('type="email"'));

const mobileTag = /<input[^>]*name="mobile"[^>]*>/.exec(homeHtml)?.[0] ?? '';
check('start-project-modal: mobile required', mobileTag.includes('required'));
check('start-project-modal: description required', /<textarea[^>]*name="description"[^>]*>/.test(homeHtml) && (/<textarea[^>]*name="description"[^>]*>/.exec(homeHtml)?.[0] ?? '').includes('required'));
check('start-project-modal: termsAccepted checkbox required', (/<input[^>]*name="termsAccepted"[^>]*>/.exec(homeHtml)?.[0] ?? '').includes('required'));
check('start-project-modal: privacyAcknowledged checkbox required', (/<input[^>]*name="privacyAcknowledged"[^>]*>/.exec(homeHtml)?.[0] ?? '').includes('required'));
check('start-project-modal: terms checkbox unchecked by default', !(/<input[^>]*name="termsAccepted"[^>]*>/.exec(homeHtml)?.[0] ?? '').includes('checked'));
check('start-project-modal: privacy checkbox unchecked by default', !(/<input[^>]*name="privacyAcknowledged"[^>]*>/.exec(homeHtml)?.[0] ?? '').includes('checked'));

// Other-service support
check('start-project-modal: "Other" service checkbox present', /name="services" value="other"/.test(homeHtml));
check('start-project-modal: other-service specify field present', /name="otherService"/.test(homeHtml));

// Service checklist sourced from the content collection (all 11 slugs)
for (const slug of SERVICE_SLUGS) {
  check(`start-project-modal: service checkbox for ${slug}`, homeHtml.includes(`name="services" value="${slug}"`));
}

// Terms/Privacy/Refund links inside the modal resolve to the standalone
// legal pages (also covered generically by the internal-link check
// above, asserted explicitly here per the V2-2 QA checklist).
check('start-project-modal: links to /terms/', /href="\/terms\/"/.test(homeHtml));
check('start-project-modal: links to /privacy/', /href="\/privacy\/"/.test(homeHtml));
check('start-project-modal: links to /refund-policy/', /href="\/refund-policy\/"/.test(homeHtml));

// Start Project trigger presence on the pages named in the V2-2 brief
const triggerPages = {
  '/ (homepage)': 'index.html',
  '/services/': 'services/index.html',
  '/services/devops/ (individual service page)': 'services/devops/index.html',
  '/process/': 'process/index.html',
  '/about/': 'about/index.html',
  '/contact/': 'contact/index.html',
};
for (const [label, relPath] of Object.entries(triggerPages)) {
  const html = readHtml(relPath);
  check(`${label}: Start Project trigger present`, /data-start-project-trigger/.test(html));
}

// Individual-service preselection wiring
const devopsHtml = readHtml('services/devops/index.html');
check('services/devops/: preselects "devops"', /data-preselect-service="devops"/.test(devopsHtml));

// Legacy/forbidden contact info must not appear anywhere in the built
// output (V2-2 brief: strict across all files changed this phase).
const FORBIDDEN_STRINGS = [
  'andbookbyte@gmail.com',
  '346-908-1336',
  '347-847-1904',
  '347)847-1904',
  '7234 fairchild',
  'Alexandria, Virginia',
];
const allDistHtmlFiles = [...Object.values(allPages)];
for (const relPath of allDistHtmlFiles) {
  if (!existsSync(join(DIST, relPath))) continue;
  const html = readHtml(relPath);
  for (const forbidden of FORBIDDEN_STRINGS) {
    check(`${relPath}: does not contain forbidden legacy text "${forbidden}"`, !html.includes(forbidden));
  }
  // No public phone number: no tel: links anywhere on the live site.
  check(`${relPath}: no tel: link`, !/href="tel:/.test(html));
}

// ---- 5. V2-3: project-request backend — static checks ---------------------
// PHP isn't executed here (no PHP runtime in this Node QA script); the
// real functional/security behavior was verified via SSH against the
// actual Namecheap PHP 8.1 runtime during V2-3 development (see the
// phase report). These are static source-presence checks that catch
// obvious regressions — the endpoint file disappearing, a security
// control being deleted, a secret being committed, etc.
const API_REL_PATH = 'api/project-request.php';
check('project-request.php: exists in deployable dist/api/', existsSync(join(DIST, API_REL_PATH)));

if (existsSync(join(DIST, API_REL_PATH))) {
  const phpSource = readFileSync(join(DIST, API_REL_PATH), 'utf-8');

  check('project-request.php: POST-only (rejects non-POST methods)', /REQUEST_METHOD'\]\s*!==\s*'POST'/.test(phpSource));
  check('project-request.php: server-side email validation (FILTER_VALIDATE_EMAIL)', phpSource.includes('FILTER_VALIDATE_EMAIL'));
  check('project-request.php: server-side mobile validation', /mobile/i.test(phpSource) && /preg_match/.test(phpSource));
  check('project-request.php: Terms validation', phpSource.includes('termsAccepted'));
  check('project-request.php: Privacy validation', phpSource.includes('privacyAcknowledged'));
  check('project-request.php: Other-service validation', phpSource.includes('otherService'));
  check('project-request.php: project-description length validation', /description.*mb_strlen|mb_strlen.*description/s.test(phpSource));
  check('project-request.php: rate-limit protection', phpSource.includes('RATE_LIMIT_MAX_REQUESTS') && phpSource.includes('rate_limit_check'));
  check('project-request.php: Origin/Referer validation', phpSource.includes('validate_origin') && phpSource.includes('HTTP_ORIGIN'));
  check('project-request.php: honeypot protection', phpSource.includes("data['website']"));
  check('project-request.php: CRLF/header-injection protection', phpSource.includes('strip_header_injection'));
  check('project-request.php: no wildcard CORS', !phpSource.includes("Access-Control-Allow-Origin: *"));
  check('project-request.php: uses central Terms Version constant', phpSource.includes('TERMS_VERSION'));
  check('project-request.php: recipient is info@byteandbook.com', phpSource.includes("RECIPIENT_EMAIL = 'info@byteandbook.com'"));
  check('project-request.php: does not spoof client email as From address', !/From:\s*['"]?\s*\$\{?email/i.test(phpSource));

  // Forbidden legacy contact strings + no committed secrets. Heuristic
  // secret scan: common credential-assignment patterns with a non-empty
  // literal value — flags anything that looks like a hardcoded
  // password/API key/SMTP credential landing in this file by accident.
  for (const forbidden of FORBIDDEN_STRINGS) {
    check(`project-request.php: does not contain forbidden legacy text "${forbidden}"`, !phpSource.includes(forbidden));
  }
  const secretPatterns = [
    /\$smtp_pass(word)?\s*=\s*['"][^'"]+['"]/i,
    /\bpassword\s*=\s*['"][^'"]+['"]/i,
    /\bapi[_-]?key\s*=\s*['"][^'"]+['"]/i,
    /\bsecret\s*=\s*['"][^'"]{6,}['"]/i,
    /-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY-----/,
  ];
  for (const pattern of secretPatterns) {
    check(`project-request.php: no hardcoded secret matching ${pattern}`, !pattern.test(phpSource));
  }
}

// Frontend wiring: fetch() POST to the one intended endpoint, no
// leftover V2-2 console logging of submission data, no GET/query-string
// path for form data. The modal's <script> has no define:vars, so Astro
// bundles it as a normal external module chunk (same as every other
// plain <script> in this codebase, e.g. Header.astro) rather than
// inlining it — the actual logic lives in that chunk, not in index.html.
const astroChunkFiles = existsSync(join(DIST, '_astro')) ? readdirSync(join(DIST, '_astro')) : [];
const modalChunkName = astroChunkFiles.find((f) => f.startsWith('StartProjectModal.astro_astro_type_script'));
check('start-project-modal: compiled script chunk exists', !!modalChunkName);
const modalScript = modalChunkName ? readFileSync(join(DIST, '_astro', modalChunkName), 'utf-8') : '';

check('start-project-modal: fetch() targets /api/project-request.php', modalScript.includes("fetch(\"/api/project-request.php\"") || modalScript.includes("fetch('/api/project-request.php'"));
check('start-project-modal: fetch() uses method: \'POST\'', /fetch\(["']\/api\/project-request\.php["'],\s*\{[^}]*method:\s*["']POST["']/.test(modalScript));
check('start-project-modal: no other endpoint referenced', (modalScript.match(/fetch\(/g) || []).length === 1);
check('start-project-modal: <form> has no method="get"', !/<form[^>]*method="get"/i.test(homeHtml));
check('start-project-modal: no leftover V2-2 console payload logging', !/console\.(debug|log)\(/.test(modalScript));
check('start-project-modal: honeypot field present', /name="website"/.test(homeHtml) && /class="sp-hp"/.test(homeHtml));

// ---- 6. V2-4: legal + checkout content ------------------------------------
const termsHtml = readHtml('terms/index.html');
const privacyHtml = readHtml('privacy/index.html');
const refundHtml = readHtml('refund-policy/index.html');
const checkoutHtml = readHtml('checkout/index.html');
// Astro preserves template source line-wrapping verbatim in compiled
// HTML text nodes (a browser collapses it visually on render; a
// literal-phrase regex against the raw file would not) — normalize
// before any multi-word phrase match below.
const norm = (html) => html.replace(/\s+/g, ' ');
const termsNorm = norm(termsHtml);
const privacyHtmlNormalized = norm(privacyHtml);
const refundNorm = norm(refundHtml);
const checkoutNorm = norm(checkoutHtml);

// Placeholder text must be gone from all four pages.
for (const [label, html] of [
  ['/terms/', termsHtml], ['/privacy/', privacyHtml],
  ['/refund-policy/', refundHtml], ['/checkout/', checkoutHtml],
]) {
  check(`${label}: no leftover "being finalized" placeholder text`, !html.includes('This page is being finalized'));
  check(`${label}: no leftover "coming soon" placeholder text`, !/coming soon/i.test(html));
}

// Terms: business-model rules actually present.
check('terms/: states project request is not a confirmed order', /project request/i.test(termsNorm) && /does not create an? (order|binding contract)/i.test(termsNorm));
check('terms/: states confirmed-order payments are non-refundable', /non-refundable/i.test(termsNorm));
check('terms/: references applicable-law exception', /applicable law/i.test(termsNorm));
check('terms/: covers third-party costs', /third-party/i.test(termsNorm));
check('terms/: covers intellectual property', /intellectual property/i.test(termsNorm));
check('terms/: covers governing law without an ugly bracket placeholder', /governing law/i.test(termsNorm) && !/\[INSERT/i.test(termsNorm) && !/TBD|TODO/.test(termsNorm));

// Refund Policy: the A-H structure's core rules.
check('refund-policy/: states project request does not place an order', /does not place an order/i.test(refundNorm));
check('refund-policy/: states confirmed-order payments are non-refundable', /non-refundable/i.test(refundNorm));
check('refund-policy/: preserves applicable-law exception', /applicable law/i.test(refundNorm));
check('refund-policy/: covers third-party costs', /third-party/i.test(refundNorm));
check('refund-policy/: does not imply duplicate payments are kept', /does not keep a payment made in error/i.test(refundNorm));

// Privacy Policy: reflects the actual Start Project form fields.
for (const term of ['full name', 'mobile', 'WhatsApp', 'project description', 'reference ID', 'rate limiting']) {
  check(`privacy/: mentions "${term}"`, new RegExp(term, 'i').test(privacyHtmlNormalized));
}
check('privacy/: contact is info@byteandbook.com', privacyHtml.includes('mailto:info@byteandbook.com'));
check('privacy/: does not claim guaranteed compliance', !/guarantee(s|d)?\s+(GDPR|CCPA)/i.test(privacyHtmlNormalized));
check('privacy/: accurately states no tracking cookies/analytics', /does not use analytics/i.test(privacyHtmlNormalized));

// Centralized Terms Version: present and identical across all three
// legal pages, and in sync with the PHP backend's own copy.
const versionOnPage = (html) => html.match(/Terms Version:\s*([^<\s]+)/)?.[1];
const termsVersionValue = versionOnPage(termsHtml);
check('terms/: Terms Version present', !!termsVersionValue);
check('privacy/: Terms Version matches terms/', versionOnPage(privacyHtml) === termsVersionValue);
check('refund-policy/: Terms Version matches terms/', versionOnPage(refundHtml) === termsVersionValue);
if (existsSync(join(DIST, API_REL_PATH)) && termsVersionValue) {
  const phpSource = readFileSync(join(DIST, API_REL_PATH), 'utf-8');
  const phpVersionMatch = phpSource.match(/TERMS_VERSION = '([^']+)'/);
  check('project-request.php: TERMS_VERSION matches the published legal pages', phpVersionMatch?.[1] === termsVersionValue);
}

// Checkout: honest state only — no fabricated merchant integration,
// bank details, or payment buttons that go nowhere.
check('checkout/: no payment method is marked "Available" (none are configured yet)', !/>Available</.test(checkoutHtml));
check('checkout/: future methods are explicitly marked "Not yet available"', checkoutHtml.includes('Not yet available'));
check('checkout/: no embedded PayPal/Stripe SDK script', !/js\.stripe\.com|paypal\.com\/sdk/i.test(checkoutHtml));
check('checkout/: no literal IBAN/routing-number labels', !/\bIBAN\b/i.test(checkoutHtml) && !/routing number/i.test(checkoutHtml));
check('checkout/: no credit-card input fields', !/name="card|autocomplete="cc-/i.test(checkoutHtml));
check('checkout/: explains checkout is only for an approved reference', /approved project reference|quotation/i.test(checkoutNorm));
check('checkout/: stays noindex (workflow page, not a search landing page)', /<meta name="robots" content="noindex, nofollow"/.test(checkoutHtml));

// No fake reviews/ratings/testimonials anywhere in the built output.
for (const relPath of allDistHtmlFiles) {
  if (!existsSync(join(DIST, relPath))) continue;
  const html = readHtml(relPath);
  const blocks = jsonLdBlocks(html);
  for (const b of blocks) {
    try {
      const parsed = JSON.parse(b);
      const nodes = Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed];
      for (const n of nodes) {
        check(`${relPath}: no fabricated Review schema`, n['@type'] !== 'Review');
        check(`${relPath}: no fabricated AggregateRating schema`, n['@type'] !== 'AggregateRating');
        check(`${relPath}: no fabricated LocalBusiness schema`, n['@type'] !== 'LocalBusiness');
      }
    } catch {
      // already flagged as invalid JSON-LD above
    }
  }
}

// ---- 7. V2-5: trust/case-study/leadership architecture --------------------
const workHtml = readHtml('work/index.html');
const workNorm = norm(workHtml);
const aboutHtml = readHtml('about/index.html');
const aboutNorm = norm(aboutHtml);

check('work/: no leftover "in progress" placeholder text', !/case studies are in progress/i.test(workNorm));
check('work/: explains methodology', /methodology|nine-stage process/i.test(workNorm));
check('work/: explains evidence standards', /evidence standard/i.test(workNorm));
check('work/: handles empty case-study state honestly', /will be published here as client-authorized work becomes available/i.test(workNorm));
check('work/: links to /process/', /href="\/process\/"/.test(workHtml));
check('work/: stays indexable (real permanent content, not a placeholder)', /<meta name="robots" content="index, follow"/.test(workHtml));

// Case-study + leadership data architecture exists, and both are
// genuinely empty — no fabricated records of either kind.
check('src/data/caseStudies.ts exists', existsSync(join(__dirname, '..', 'src', 'data', 'caseStudies.ts')));
check('src/data/leadership.ts exists', existsSync(join(__dirname, '..', 'src', 'data', 'leadership.ts')));
if (existsSync(join(__dirname, '..', 'src', 'data', 'caseStudies.ts'))) {
  const caseStudiesSource = readFileSync(join(__dirname, '..', 'src', 'data', 'caseStudies.ts'), 'utf-8');
  check('caseStudies.ts: array is empty (no fabricated case studies)', /caseStudies:\s*CaseStudy\[\]\s*=\s*\[\s*\]/.test(caseStudiesSource));
}
if (existsSync(join(__dirname, '..', 'src', 'data', 'leadership.ts'))) {
  const leadershipSource = readFileSync(join(__dirname, '..', 'src', 'data', 'leadership.ts'), 'utf-8');
  check('leadership.ts: profiles array is empty (no unverified team data)', /leadershipProfiles:\s*LeadershipProfile\[\]\s*=\s*\[\s*\]/.test(leadershipSource));
}
check('components/trust/CaseStudyCard.astro exists', existsSync(join(__dirname, '..', 'src', 'components', 'trust', 'CaseStudyCard.astro')));
check('components/trust/LeadershipCard.astro exists', existsSync(join(__dirname, '..', 'src', 'components', 'trust', 'LeadershipCard.astro')));
check('components/trust/TrustBadge.astro exists', existsSync(join(__dirname, '..', 'src', 'components', 'trust', 'TrustBadge.astro')));

// About page: still builds, trust section present, leadership section
// absent while the data array is empty (per CLAUDE.md: omit rather than
// show a placeholder).
check('about/: "How we build trust" section present', /how we build trust/i.test(aboutNorm));
check('about/: no Leadership section while leadershipProfiles is empty', !/<h2[^>]*>Leadership<\/h2>/i.test(aboutHtml));

// Site-wide: no fake testimonial identities inherited from the old
// site, no star-rating characters, no empty "#" social placeholder
// links, anywhere in the built output.
const LEGACY_FAKE_IDENTITIES = ['John Smith', 'Emily Johnson', 'Michael Brown', 'Future Systems'];
for (const relPath of allDistHtmlFiles) {
  if (!existsSync(join(DIST, relPath))) continue;
  const html = readHtml(relPath);
  for (const identity of LEGACY_FAKE_IDENTITIES) {
    check(`${relPath}: no legacy fake identity "${identity}"`, !html.includes(identity));
  }
  check(`${relPath}: no star-rating characters (★/⭐)`, !/[★⭐]/.test(html));
  check(`${relPath}: no empty href="#" placeholder links`, !/href="#"/.test(html));
  check(`${relPath}: no "Trusted by N+ clients"-style claim`, !/trusted by \d/i.test(html));
  check(`${relPath}: no "Award winning" / "Top rated" claim`, !/award.winning|top.rated/i.test(html));
}

// Organization schema: sameAs present only when a verified social URL
// actually exists (config/site.ts currently has none).
const siteConfigSource = readFileSync(join(__dirname, '..', 'src', 'config', 'site.ts'), 'utf-8');
const hasVerifiedSocial = /linkedin:\s*['"]/.test(siteConfigSource) || /github:\s*['"]/.test(siteConfigSource) ||
  /clutch:\s*['"]/.test(siteConfigSource) || /trustpilot:\s*['"]/.test(siteConfigSource);
check('config/site.ts: no verified social URL is set yet (expected for this phase)', !hasVerifiedSocial);
if (!hasVerifiedSocial) {
  check('homepage: Organization schema has no sameAs (no verified profiles yet)', !homeHtml.includes('"sameAs"'));
}

// Legacy root files: confirmed obsolete (byte-identical, unreferenced
// by the Astro build) and removed from the working tree in V2-5 — make
// sure they don't silently reappear as build inputs.
const repoRoot = join(__dirname, '..', '..');
check('legacy root index.html removed from working tree', !existsSync(join(repoRoot, 'index.html')));
check('legacy root "byteandbook github.txt" removed from working tree', !existsSync(join(repoRoot, 'byteandbook github.txt')));

// ---- 8. V2-6: US-market localization + visual-upgrade regression guards ---
const stylesCss = readFileSync(join(DIST, 'styles.css'), 'utf-8');

// US-market localization audit
const FORBIDDEN_REGION_CUES = ['+92', 'PKR', 'Rs.', 'Karachi', 'Pakistan'];
const FAKE_US_IDENTITY_CLAIMS = [
  'Based in New York', 'US Headquarters', 'U.S. Headquarters', 'Delaware LLC', 'Wyoming LLC',
];
for (const relPath of allDistHtmlFiles) {
  if (!existsSync(join(DIST, relPath))) continue;
  const html = readHtml(relPath);
  for (const cue of FORBIDDEN_REGION_CUES) {
    check(`${relPath}: no Pakistan-specific cue "${cue}"`, !html.includes(cue));
  }
  for (const claim of FAKE_US_IDENTITY_CLAIMS) {
    check(`${relPath}: no fake US legal-identity claim "${claim}"`, !html.includes(claim));
  }
}
check('start-project-modal: phone placeholder uses a US-format example (+1)', homeHtml.includes('placeholder="+1 202 555 0123"'));
check('start-project-modal: no +92 placeholder remains', !homeHtml.includes('+92'));
check('start-project-modal: mobile field stays international (type="tel", no US-only pattern)', mobileTag.includes('type="tel"') && !mobileTag.includes('pattern='));
check('start-project-modal: "Include your country code" guidance still present', /include your country code/i.test(norm(homeHtml)));

// Visual-upgrade regression guards: reduced-motion + lazy-loading
// architecture must survive the art-direction pass unchanged.
check('styles.css: prefers-reduced-motion media query still present', stylesCss.includes('prefers-reduced-motion'));
const baseLayoutScriptChunk = astroChunkFiles.find((f) => f.startsWith('BaseLayout.astro_astro_type_script'));
check('BaseLayout script chunk exists (reduced-motion gate wiring)', !!baseLayoutScriptChunk);
// The actual matchMedia('(prefers-reduced-motion: reduce)') check lives
// in scripts/motion.ts, imported by BaseLayout's inline script — check
// the real motion.*.js chunk, not BaseLayout's (which only imports and
// calls it, and after minification contains neither string literally).
const motionUtilChunk = astroChunkFiles.find((f) => f.startsWith('motion.'));
check('motion.ts chunk exists', !!motionUtilChunk);
if (motionUtilChunk) {
  const motionChunkSrc = readFileSync(join(DIST, '_astro', motionUtilChunk), 'utf-8');
  check('motion.ts chunk: prefers-reduced-motion check still wired up', /prefers-reduced-motion/i.test(motionChunkSrc));
}
// Each Level 1 3D scene still compiles to its own separate lazy-loaded
// chunk (not inlined into a shared bundle) — confirms the V2-6 color
// changes didn't collapse the dynamic-import architecture from Phase 11.
const expectedSceneChunkPrefixes = ['heroScene', 'hardwareScene', 'brandScene', 'bookScene', 'nodeGraphScene', 'dataEcosystemScene', 'capabilityScene', 'ambientFieldScene'];
for (const prefix of expectedSceneChunkPrefixes) {
  check(`lazy-loading: separate compiled chunk exists for ${prefix}`, astroChunkFiles.some((f) => f.startsWith(prefix)));
}

// Pillar color system: new tokens/utilities actually compiled, and the
// sitewide primary CTA color is untouched (Start a Project must look
// identical everywhere regardless of pillar). Checked via plain
// substring match against the exact Tailwind-escaped selector text
// (confirmed by inspecting the real compiled output) rather than a
// dynamically-built regex — the opacity-modifier utilities below only
// compile at all because of the --bb-*-500-rgb / <alpha-value> fix
// documented in global.css; this guards against that regressing.
for (const selector of [
  '.text-growth-400{', '.text-tech-400{', '.text-infra-400{',
  '.bg-growth-500\\/10{', '.bg-tech-500\\/10{', '.bg-infra-500\\/10{', '.bg-signal-500\\/10{', '.bg-ember-500\\/10{',
]) {
  check(`styles.css: pillar/opacity utility ${selector} compiled`, stylesCss.includes(selector));
}
check('styles.css: --bb-growth-500 token defined', stylesCss.includes('--bb-growth-500'));
check('styles.css: --bb-tech-500 token defined', stylesCss.includes('--bb-tech-500'));
check('styles.css: --bb-infra-500 token defined', stylesCss.includes('--bb-infra-500'));
check('styles.css: --bb-signal-500-rgb channel twin defined (opacity-modifier fix)', stylesCss.includes('--bb-signal-500-rgb'));

// Service pages actually wire a pillar accent into their Level 1 scene
// (or, for computer-hardware/branding, into the retinted .ts scene) —
// spot-check one page per family rather than all 11.
const devopsHtmlV6 = readHtml('services/devops/index.html');
check('services/devops/ (Infrastructure): pillar badge uses infra color', /text-infra-400/.test(devopsHtmlV6));
const seoHtmlV6 = readHtml('services/seo/index.html');
check('services/seo/ (Growth): pillar badge uses growth color', /text-growth-400/.test(seoHtmlV6));
const webDevHtmlV6 = readHtml('services/web-development/index.html');
check('services/web-development/ (Technology): pillar badge uses tech color', /text-tech-400/.test(webDevHtmlV6));

// Process timeline: connected visual present, heading hierarchy intact.
const processHtmlV6 = readHtml('process/index.html');
check('process/: connected timeline structure present (<ol> of stages)', /<ol[^>]*class="relative"/.test(processHtmlV6));

// ---- 9. V2-7: Insights architecture + final pre-release regression --------
const insightsHtml = readHtml('insights/index.html');
const insightsNorm = norm(insightsHtml);

check('insights/: no leftover "coming soon" placeholder text', !/articles are coming soon/i.test(insightsHtml) && !/coming soon/i.test(insightsHtml));
check('insights/: real permanent content present (knowledge areas)', /knowledge areas/i.test(insightsNorm));
check('insights/: AI search / GEO explanation present', /generative engine optimization|ai search/i.test(insightsNorm));
check('insights/: evidence standards present', /evidence standard/i.test(insightsNorm));
check('insights/: honest empty-article-state message present', /first articles are in progress/i.test(insightsNorm));
check('insights/: links to at least 3 real service pages', (insightsHtml.match(/href="\/services\/[a-z-]+\/"/g) || []).length >= 3);
check('insights/: links to /work/ (evidence-standard cross-link)', /href="\/work\/"/.test(insightsHtml));
check('src/content.config.ts: insights collection schema exists', readFileSync(join(__dirname, '..', 'src', 'content.config.ts'), 'utf-8').includes("defineCollection"));
check('src/content/insights/: no fake article files (collection is empty)', !existsSync(join(__dirname, '..', 'src', 'content', 'insights')) || readdirSync(join(__dirname, '..', 'src', 'content', 'insights')).length === 0);
check('components/insights/InsightCard.astro exists', existsSync(join(__dirname, '..', 'src', 'components', 'insights', 'InsightCard.astro')));
if (existsSync(join(__dirname, '..', 'src', 'components', 'insights', 'InsightCard.astro'))) {
  const cardSrc = readFileSync(join(__dirname, '..', 'src', 'components', 'insights', 'InsightCard.astro'), 'utf-8');
  // Matches a *quoted string literal* fallback (e.g. author || 'ByteAndBook Team')
  // — not prose mentioning the phrase, which the file's own explanatory
  // comment does deliberately.
  check('InsightCard.astro: no hardcoded fallback author string literal', !/['"]ByteAndBook Team['"]/i.test(cardSrc));
}

// Work <-> Insights cross-link (internal linking improvement).
check('work/: links to /insights/', /href="\/insights\/"/.test(workHtml));

// GEO service page: SEO-vs-GEO clarification present, no guaranteed-
// citation/ranking claims.
const geoHtml = readHtml('services/geo/index.html');
const geoNorm = norm(geoHtml);
check('services/geo/: distinguishes SEO from GEO', /GEO and SEO are related, not identical/i.test(geoNorm));
// Checks for an *affirmative* guarantee claim ("we guarantee...",
// "guaranteed to rank/cite/recommend you"), not just the co-occurrence
// of "guarantee" near "citation/ranking" — the page deliberately
// contains an honest disclaimer ("we don't promise... guaranteed
// citations"), which must NOT trip this check.
check('services/geo/: does not promise guaranteed AI citations/ranking', !/we guarantee|guaranteed to (rank|cite|recommend)/i.test(geoNorm));
check('services/geo/: explicitly disclaims guaranteed citations/ranking', /don't promise|do not promise|no one can (control|promise|guarantee)/i.test(geoNorm));

// Homepage: new US-market FAQ present, FAQ content not duplicated
// verbatim elsewhere (spot-check against the GEO/Insights pages, the
// two other pages most likely to carry similar Q&A-style content).
check('/: new "available outside the US" FAQ present', /available to businesses outside the us/i.test(norm(homeHtml)));

// Final placeholder-text sweep: every real content page (i.e. every
// indexable page, plus /checkout/ which legitimately still says
// "in progress" honestly) must not contain the old generic V2-1
// "placeholder" copy.
for (const [route, relPath] of Object.entries(indexablePages)) {
  const html = readHtml(relPath);
  check(`${route}: no leftover "being finalized" placeholder text`, !html.includes('This page is being finalized'));
}

// robots.txt: legitimate public content isn't accidentally blocked, and
// the backend API path was never added to Disallow (it isn't a page to
// crawl, but it also isn't a "secret" that needs hiding via robots.txt
// — real protection is server-side, covered by the V2-3 checks above).
check('robots.txt: does not block /services/', !robotsTxt.includes('Disallow: /services'));
check('robots.txt: does not block /work/', !robotsTxt.includes('Disallow: /work/'));
check('robots.txt: does not block /insights/', !robotsTxt.includes('Disallow: /insights/'));
check('robots.txt: does not block /terms/, /privacy/, or /refund-policy/', !/Disallow: \/(terms|privacy|refund-policy)\//.test(robotsTxt));

// ---- Report ---------------------------------------------------------------
console.log(`QA check: ${checks} assertions, ${failures.length} failure(s).`);
if (failures.length > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
} else {
  console.log('All checks passed.');
}
