// Single source of truth for the Terms of Service / Privacy Policy
// version stamp attached to every project-request submission (see
// CLAUDE.md's Terms Acceptance + Terms Version sections). Bump this one
// string when the published Terms/Privacy/Refund text changes — the
// V2-3 backend will record it as submission evidence alongside
// termsAccepted/privacyAcknowledged.
//
// v2 (2026-08-v2): V2-4 replaced the V2-1 placeholder /terms/, /privacy/,
// and /refund-policy/ pages with real published policy text — bumped
// from v1 (which never had real public policy behind it) accordingly.
// The PHP backend's own copy of this constant (public/api/project-request.php)
// must be updated to match by hand whenever this value changes — there's
// no shared build step between the two languages/runtimes.
//
// v3 (2026-09-v3): Privacy Policy §7/§9 now disclose Google Analytics 4 and
// Google Signals (published 2026-09-27), and Terms §28 states ByteAndBook
// is a New York LLC (2026-09-28).
export const TERMS_VERSION = '2026-09-v3';
