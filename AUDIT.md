# ByteAndBook — Phase 1 Audit

Date: 2026-08-27
Scope: read-only inspection of the current project directory. No files were
modified, no database imported, no ZIP extracted.

## 1. Environment
- OS: Windows 10, shell access via Git Bash / PowerShell.
- Not currently a Git repository (`git status` not applicable — no `.git`).
- Installed tooling found on PATH:
  - Node.js v24.19.0
  - npm 11.17.0 (npx included)
  - Git 2.52.0
  - Python 3.14.7
  - pnpm / yarn: not installed
- No project manifest exists yet (no `package.json`, no build config).

This is sufficient to support a modern static-site build pipeline (Vite,
Astro, 11ty, etc.) without installing anything system-wide. Nothing was
installed in this phase.

## 2. File inventory
| File | Notes |
|---|---|
| `index.html` | Live application source. 1,224 lines, single file. |
| `byteandbook github.txt` | **Byte-identical** to `index.html` (MD5 `62b9985a9d2a170f2e816cef1276f764` for both). Confirmed duplicate, not a divergent version. |
| `bytesbra_wp928.sql` | phpMyAdmin dump, DB `bytesbra_wp928`, prefix `wpfq_`. Orphaned legacy WordPress DB — not imported/read beyond table names. |
| `byteandbook-backup-2026-08-26.zip` | Contains 4 entries (see below). Not extracted. |
| `CLAUDE.md` | Permanent project instructions. |

### ZIP contents (listing only, not extracted)
```
.well-known/
.well-known/pki-validation/
.well-known/pki-validation/E476EA0750A6BA2B1491E0CE1C11B6E8.txt   (93 bytes)
index.html                                                        (85,067 bytes)
```
This confirms the backup is the correct thing to preserve for SSL
validation continuity (`.well-known/pki-validation`) plus a copy of the
live page. Matches the "never overwrite" rule already in CLAUDE.md.

### SQL dump — tables present (names only)
```
wpfq_commentmeta, wpfq_comments, wpfq_links, wpfq_litespeed_url,
wpfq_litespeed_url_file, wpfq_options, wpfq_postmeta, wpfq_posts,
wpfq_termmeta, wpfq_terms, wpfq_term_relationships, wpfq_term_taxonomy,
wpfq_usermeta, wpfq_users
```
Standard WordPress core schema (LiteSpeed cache plugin present). No custom
e-commerce/CRM tables. Confirms this is a generic WP install, not a
data source that needs migrating for a marketing-site rebuild. No row
data was read.

## 3. `index.html` structure audit
Single-page site, Tailwind CDN + vanilla JS, dark theme, sections:
`Header/Nav` → `Hero` → `About + Team` → `Products carousel` →
`Services` → `Portfolio` → `Clients/testimonials` → `Contact` →
`Login/Signup modal` → `Cart/Checkout modal` → `Footer`.

**External runtime dependencies (all via CDN/hotlink, no local assets):**
- Tailwind CDN (`cdn.tailwindcss.com`) — not suitable for production
  (large runtime CSS generation, no purge).
- Google Fonts (Inter), Font Awesome 6.4.0 (cdnjs).
- Images: mix of Unsplash hotlinks, a `gstatic.com` thumbnail proxy URL,
  a third-party `website-files.com` GIF, and two large base64-embedded
  JPEGs inline in the HTML (team photos) — this alone accounts for a
  large share of the file's 85KB.

**Code quality issues found:**
- Login/signup form handling is implemented **twice** with two separate
  `<script>` blocks (~line 528 and ~line 1115), both attaching submit
  listeners to `localStorage`-backed `registeredUsers`. This is dead/
  duplicate logic, not a functioning production auth system.
- Cart/checkout logic (~line 832 onward) also stores state in
  `localStorage` (`bb_cart`) and simulates checkout success client-side
  only — no backend, no payment, no email.
- Contact form explicitly demo-only: `e.preventDefault()` +
  `alert('This is a demo form — submissions are disabled.')`.
- Everything lives in one 1,224-line HTML file — no separation of
  concerns, not maintainable at the scope the rebuild requires.

**SEO baseline: effectively absent.**
- No meta description, no canonical URL, no Open Graph/Twitter tags, no
  structured data (JSON-LD), no `sitemap.xml`, no `robots.txt` in the
  directory, single generic `<title>`.
- Heading structure is reasonable per-section (H2/H3) but there's no
  SEO-driven page-per-service structure (site is one page).

## 4. Content integrity flags (per CLAUDE.md — do not carry forward unverified)
The following content in `index.html` cannot be verified as genuine and
must not be assumed real:
- **Team members** "Alex Johnson" (Creative Director), "Sarah Chen" (3D
  Animation Lead), "Mike Rodriguez" (IT Solutions Manager) — with photos
  (two inline base64 stock-style JPEGs, one hotlinked Google thumbnail).
- **Client testimonials** — "Emily Johnson / Global Solutions", "John
  Smith / Tech Innovators", "Michael Brown / Future Systems" — with 5-star
  ratings, no attribution source.
- **Product ratings** on the digital-products carousel (4.8, 4.9, 4.7
  stars) — no review source.
- **Footer contact info** — a physical address ("7234 Fairchild Drive
  Apt 204, Alexandria, Virginia") and two phone numbers. This may be
  genuine business info or placeholder — status is unknown and needs
  your confirmation before it's reused anywhere in the rebuild.
- **Portfolio images** are generic Unsplash stock photos, not real project
  work.

Per the CONTENT INTEGRITY rule, none of this will be carried into the
rebuild until you confirm what's real vs. placeholder (this will matter
most in Phase 8, but flagging now since it affects overall scope).

## 5. Confirmed alignment with CLAUDE.md environment claims
- No PHP, no WordPress runtime, no backend/API, no live DB connection —
  confirmed by inspection (no server-side includes, all logic is
  client-side JS).
- Login/signup/cart/checkout confirmed demo-only, `localStorage`-backed —
  confirmed, matches CLAUDE.md.
- Contact form confirmed disabled/demo-only — confirmed.

## 6. Not yet done (belongs to later phases, not started)
- No architecture decisions made (Phase 2).
- No Git repository initialized yet (Phase 3).
- No design system, pages, or code written.
