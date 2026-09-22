# Phase 1 — Service Architecture, Trust Foundations, Copy & Accessibility

**Branch:** `phase-1-ia` (not merged to `main`, not deployed)
**Status:** Complete — all 10 tasks done, QA passed, ready for review.

---

## 1. What changed

### Service IA (Tasks 1–5)
- Added a `category` field to the services content collection
  (`src/content.config.ts`, all 11 `src/content/services/*.md` files),
  mapping the existing 11 services into 3 public categories defined in
  the new `src/lib/categories.ts`:
  - **Growth & AI Discovery** — Digital Marketing, SEO, GEO, Social
    Media Marketing
  - **Web, Brand & Publishing** — Web Development, Software
    Development, Branding & Logo Design, eBook & Digital Publishing
  - **Infrastructure, Cloud & Automation** — DevOps, Cloud Services,
    Computer Hardware
  - The internal `pillar` field (drives icon/badge color) is untouched.
- Built 3 new category pages (`src/pages/services/growth-ai-discovery.astro`,
  `web-brand-publishing.astro`, `infrastructure-automation.astro`), each
  with a buyer-focused promise, "Who This Is For," "What's Included"
  (linking every service), "How the Work Runs," and one Start a Project
  CTA — each with a **deliberately different section layout** (numbered
  list vs. alternating split rows vs. connected pipeline diagram) so the
  three don't read as one template repeated 3 times.
- Redesigned `/services/` as a 3-category decision page with a small,
  accessible guided selector (3 buttons, progressive enhancement — all
  categories render in plain HTML with no JS; JS adds single-category
  filtering with `aria-pressed` state).
- Homepage: replaced the 4-pillar-card section and 11-service grid with
  one "Three Ways We Can Help" section of 3 category entry points. Hero
  visuals (HeroScene 3D, gradient/grid backdrop) are unchanged.
- Every service page (`[slug].astro`) now has a 4-level breadcrumb (Home
  → Services → Category → Service), links back to its category badge,
  and pulls "Related Services" from the same category first. `Service`
  and `BreadcrumbList` JSON-LD both include the category level.
- Header: "Services" is now an accessible disclosure menu (button +
  `aria-expanded`/`aria-controls`, opens on click/hover/focus, closes on
  Escape/outside-click/blur, focus returns to the toggle) listing the 3
  categories plus "View All Services." Mobile nav lists the same 3
  categories. Footer: removed the non-functional "Checkout" link (the
  route itself still exists, `noindex`, per the earlier "no nav for
  non-functional features" decision).
- `sitemap.xml` / `robots.txt` updated automatically (3 new indexable
  routes); internal links updated everywhere they pointed at the old
  structure.

### US localization (Task 6)
- Start a Project form: phone field relabeled "Phone Number," US-format
  placeholder `(555) 123-4567`, client-side validation requires a
  10-digit US number (optionally prefixed `+1`/`1`).
- `public/api/project-request.php`: server-side validation now enforces
  the same 10-digit US rule (previously accepted any `+`-prefixed
  international format).
- Homepage FAQ and footer copy repositioned around "US-based agency"
  rather than "accepts any country code."
- Swept the codebase for Pakistan-specific patterns (phone codes,
  currency, city names) — none found beyond what `qa-check.mjs` already
  guards against.

### Accessibility & design system (Task 7)
- Contrast: `text-ink-400` → `text-ink-300` (prose/captions/placeholders,
  including the `--bb-text-faint` token that drives form/chat
  placeholder color); flow-diagram arrows `ink-600` → `ink-400`; large
  decorative step numerals `ink-700` → `ink-600`.
- Touch targets: mobile menu toggle, modal close, chat close/send now
  ≥44×44px; `Button` component gets a 44px min-height floor sitewide.
- `min-h-screen` → `min-h-dvh` (hero, 404) for dynamic-viewport-safe
  sizing on mobile browser chrome.
- `transition-all` → explicit property lists on `Card`/`Button`.
- Distinct nav landmark labels: desktop `aria-label="Primary"` vs.
  mobile `aria-label="Mobile"` (previously both said "Primary").
- New fluid type scale wired into Tailwind as semantic roles
  (`text-display`, `text-page-title`, `text-section-title`) from the
  `clamp()` tokens that existed in `global.css` but were never applied —
  now used on every page's H1 and every `SectionHeading` H2.
- Added `public/favicon.svg` + `<link rel="icon">` in `BaseLayout`.

### Copy (Task 10)
- Homepage hero rewritten to the exact direction given: "Websites,
  Brands, Ebooks and Cloud Systems" / "Built by One Team."
- `/services/` heading rewritten to the exact direction given: "What We
  Can Build for You."
- Every heading sitewide (marketing pages — home, services, category
  pages, service pages, about, process, work, insights, contact,
  checkout, 404) rewritten to Title Case, short phrases, no em dashes,
  no "not X, but Y" contrasts. Full before → after list in §2.
- Removed literal banned words found in the codebase: **engineered**
  (2 service meta descriptions), **connected system** / **connected
  discipline** (about.astro meta description + principles copy, service
  page component comment untouched as it's a code comment, not
  copy).
- Removed stale "four pillars / four disciplines" public-facing
  language now that services are organized into 3 categories (process
  subheading, work.astro capability-areas heading, insights.astro
  intro paragraph).
- **Scope decision:** legal document headings (`terms.astro`,
  `privacy.astro`, `refund-policy.astro` — numbered clauses like "8.
  Non-refundable confirmed orders") and their body prose were left
  untouched. They aren't in Task 10's named surfaces (headings, hero,
  CTAs, service copy, FAQ, meta descriptions), and editing legal
  wording is outside this phase's scope. Long-form body prose on About/
  Work/Insights that used a "not X" construction was also left alone
  where it wasn't a heading/CTA/card-title — only headings and card
  titles were rewritten there.

### SEO/technical audit (Task 8)
- Trimmed 3 meta descriptions that exceeded 160 characters (about,
  process, work — all now ≤160).
- Verified sitewide: every JSON-LD block parses as valid JSON (27
  pages checked), no duplicate `<title>` or meta description across
  pages, canonical present and absolute on every page, no heading-level
  skips (h1→h3 with no h2) on any page, `robots.txt` excludes only
  `/style-guide/`, `/404.html`, `/checkout/` and nothing else, sitemap
  contains exactly the 24 indexable routes.
- `scripts/qa-check.mjs` updated for the new route count (24 → 27
  total, 21 → 24 indexable), the new US-phone assertions, and the new
  homepage FAQ text — extended, not weakened; all prior regression
  guards (V2-1 through V2.1) still run and still pass.

---

## 2. Heading changes (before → after)

| Page | Before | After |
|---|---|---|
| Home | "Growth, engineered like infrastructure." | "Websites, Brands, Ebooks and Cloud Systems / Built by One Team" |
| Home | "Four disciplines, one system" | "Three Ways We Can Help" |
| Home | "Explained visually, not with stock photos" | *(section merged into "Three Ways We Can Help")* |
| Home | "A consistent process, applied to every discipline" | "How We Work" |
| Home | "Common questions" | "Common Questions" |
| Home | "Ready to start a project?" | "Ready to Start a Project?" |
| /services/ | "Four disciplines, eleven services, one connected system." | "What We Can Build for You" |
| /services/ | "Not sure which service fits?" | "Not Sure Which One Fits?" |
| Service pages | "Related services" | "Related Services" |
| Service pages | "Discuss a {devops} project" *(`.toLowerCase()`)* | "Discuss a DevOps Project" *(preserves title casing)* |
| About | "Growth, engineering, and infrastructure, built as one discipline." | "Growth, Engineering and Infrastructure / Built as One Team" |
| About | "How we work" | "How We Work" |
| About | "One system, not four vendors" | "One Team Instead of Four Vendors" |
| About | "Explain the mechanism, not just the outcome" | "We Show You How It Works" |
| About | "How we build trust" | "How We Build Trust" |
| About | "See how it applies to your project" | "See How It Applies to Your Project" |
| Process | "A consistent process, applied to every discipline." | "How Every Project Runs" |
| Process | "Request vs. order" | "Request vs. Order" |
| Process | "Ready to start?" | "Ready to Start?" |
| Work | "How we work, and how we prove it" | "How We Work / And Prove It" |
| Work | "The same process, every project" | "The Same Process Every Time" |
| Work | "What we build, across four pillars" | "What We Build" |
| Work | "Verifiable, not just stated" *(card title)* | "Verified With a Real Source" |
| Work | "What it takes for work to appear here" | *(same text, Title Case eyebrow fix: "Evidence standards" → "Evidence Standards")* |
| Work | "Verified project work" | "Verified Project Work" |
| Work | "Want to be the first case study?" | "Want to Be the First Case Study?" |
| Insights | "Insights & knowledge" | "Insights & Knowledge" |
| Insights | "Real explainers, not filler" | "Explainers Backed by Real Work" |
| Insights | "Organized the same way we work" | *(Title Case; eyebrow "Knowledge areas" → "Knowledge Areas")* |
| Insights | "Sources cited, not invented" *(card title)* | "Every Source Is Real" |
| Insights | "AI search & GEO" | "AI Search & GEO" |
| Insights | "The same standard as our Work page" | *(Title Case; eyebrow "Evidence standards" → "Evidence Standards")* |
| Insights | "Latest insights" | "Latest Insights" |
| Insights | "Have a project in mind?" | "Have a Project in Mind?" |
| Contact | "Start a project" | "Start a Project" |
| Contact | "Request a project" | "Request a Project" |
| Contact | "Helpful to include" | "Helpful to Include" |
| Checkout | "Have an approved project reference?" | "Have an Approved Project Reference?" |
| Checkout | "Future payment methods" | "Future Payment Methods" |
| 404 | "This page doesn't exist" | "This Page Doesn't Exist" |
| GEO service | title: "GEO — Generative Engine Optimization" *(em dash)* | "GEO (Generative Engine Optimization)" |

New headings introduced (category pages, no "before"): "Growth & AI
Discovery," "Web, Brand & Publishing," "Infrastructure, Cloud &
Automation," "Who This Is For," "What's Included," "How the Work Runs,"
plus per-category CTAs ("Ready to Get Found?," "Ready to Build
Something?," "Ready to Fix Your Infrastructure?").

---

## 3. QA results

**Build:** `npm run build` — 27 pages, zero errors.
**Automated QA:** `npm test` (`scripts/qa-check.mjs`) — **1,926
assertions, 0 failures.**

**Playwright, manual pass** (375px / 768px / 1440px):
- All routes load; no horizontal scroll at any width (`scrollWidth` ≤
  `innerWidth` confirmed via `document.documentElement.scrollWidth`).
- Zero console errors on every page checked (home, /services/, both
  category pages, a service page). One pre-existing, unrelated
  `THREE.Clock` deprecation *warning* (not an error) from the Three.js
  library itself — not introduced by this phase, out of scope to fix.
- Mobile nav (375/768px): toggle opens/closes correctly, lists the 3
  categories + "View All Services" + Process/About/Contact + Start a
  Project.
- Desktop Services disclosure menu (1440px): opens on click/hover,
  lists the 3 categories with hint text + "View All Services."
- `/services/` guided selector: clicking a category button filters to
  just that category's panel (verified "Build a Website, Brand or
  Ebook" → only the Web/Brand/Publishing panel + its 4 services
  remained visible) and updates `aria-pressed`/status text.
- Start a Project modal: submitting phone `123` is rejected client-side
  ("Please enter a valid US phone number, e.g. (555) 123-4567.");
  `(555) 123-4567` passes validation and proceeds to the network
  request (which then correctly fails with a generic offline-safe
  message, since this static preview has no PHP runtime — expected in
  this environment, not a bug).
- AI Assistant panel opens cleanly with quick-question chips, input,
  and disclaimer text; no console errors.

**Keyboard-only navigation** (1440px, no mouse):
- Tab order: skip link → logo → **Services toggle** → Process → About
  → Contact → Start a Project.
- `Enter` on the Services toggle opens the menu (`aria-expanded` flips
  to `true`); `Tab` moves focus into the first category link inside the
  open menu.
- `Escape` closes the menu, sets `aria-expanded="false"`, and returns
  focus to the toggle button — standard disclosure-button pattern,
  verified programmatically via `document.activeElement`.

**Technical SEO** (scripted checks against `dist/`):
- 0 heading-hierarchy skips (h1→h3 with no h2) across all 26 non-style-guide pages.
- 0 invalid JSON-LD blocks across 27 pages.
- 0 titles or meta descriptions over length after the Task 8 trim.
- 0 duplicate titles/descriptions across pages.

---

## 4. Lighthouse — before / after

**Method:** "Before" = a `git worktree` build of `master` at commit
`125e13c` (the last commit before this branch), served via `astro
preview` on port 4322. "After" = this branch's build, same server type,
port 4321. Both audited with Lighthouse 13.5.0 / headless Chrome, one
run each (not averaged over multiple runs).

**Important caveat:** this machine ran all 14 audits back-to-back under
real resource contention (this session's own dev servers, Playwright's
browser, and — until cleaned up mid-way — a pile of orphaned Chrome
processes from earlier failed runs competing for CPU). Lighthouse's
mobile preset uses 4x CPU throttling, which is far more sensitive to
that kind of contention than desktop. The **desktop numbers are stable
and directionally trustworthy; the mobile numbers should be treated as
illustrative, not authoritative** — e.g. `before-devops-mobile`'s
5,350ms Total Blocking Time is implausibly high for a page whose
`after` counterpart (same component budget) measured 350ms. Re-run
mobile audits in a quiet CI/device environment before using these
numbers to gate anything.

| Page | Form factor | Before (Perf) | After (Perf) | Before LCP | After LCP | Before TBT | After TBT |
|---|---|---|---|---|---|---|---|
| Home | Mobile | 66 | 50 | 3.3s | 4.1s | 780ms | 1,800ms |
| Home | Desktop | 93 | 95 | 1.2s | 1.1s | 30ms | 0ms |
| /services/ | Mobile | 74 | 87 | 3.3s | 3.0s | 410ms | 0ms |
| /services/ | Desktop | 97 | 98 | 0.9s | 0.9s | 60ms | 0ms |
| Category page (infra) | Mobile | *n/a — new page* | 71 | — | 4.6s | — | 0ms |
| Category page (infra) | Desktop | *n/a — new page* | 96 | — | 1.1s | — | 0ms |
| Service page (devops) | Mobile | 62 | 72 | 1.7s | 3.7s | 5,350ms | 350ms |
| Service page (devops) | Desktop | 90 | 95 | 1.3s | 1.1s | 80ms | 0ms |

Accessibility/Best Practices/SEO categories were 95–100 across every
page, both before and after (SEO stayed a flat 100 everywhere).

**Reading this honestly:**
- Desktop clearly holds or improves everywhere — a real, low-noise
  signal that Phase 1's markup/JS changes didn't add desktop weight.
- `/services/` and its individual service pages get *lighter* in this
  measurement (JS transfer dropped from 283KB to ~96–98KB on the
  category/services pages specifically), consistent with the new pages
  not pulling in the old 11-card grid's `CapabilitySystem3D` wiring.
- The **home mobile regression (66→50) is the one number worth
  investigating for real**, not just noise: the new two-line hero
  headline plus the `CapabilitySystem3D` canvas both sit above the fold
  on mobile, and TBT roughly doubled. Recommend re-measuring on a clean
  runner before Phase 2, and if it holds, profiling whether the hero
  section's Level 1 3D (`HeroScene`) is competing with
  `CapabilitySystem3D`'s canvas for main-thread time on first paint.

---

## 5. Open issues / not done in this phase

1. **Lighthouse mobile numbers need a clean re-run.** See §4 — this
   environment's resource contention makes the mobile TBT swings
   (5,350ms → 350ms on the same devops page) implausible as a real
   signal. Desktop numbers are trustworthy; mobile isn't yet.
2. **Home mobile Performance regression (66→50)** should be profiled
   before Phase 2 3D work begins, in case the hero's two concurrent
   canvases (`HeroScene` + `CapabilitySystem3D`) need to be staggered
   or one deferred until user interaction.
3. **`style-guide.astro`** (internal, `noindex` reference page) was
   only lightly touched (one banned-word fix) — its headings/layout
   still reflect the pre-Phase-1 pattern. Low priority since it's not
   public, but worth a pass whenever the design system doc itself gets
   revisited.
4. **Legal pages unchanged.** `terms.astro`, `privacy.astro`,
   `refund-policy.astro` numbered-clause headings and body prose were
   deliberately left alone (out of Task 10's scope, see §1) — they
   still use the old fixed-size heading classes rather than the new
   semantic type tokens. Not a functional issue.
5. **Category accent color is a judgment call, not spec'd.** Growth &
   AI Discovery and Infrastructure/Cloud/Automation map 1:1 onto the
   existing Growth/Infrastructure pillar colors (both were already
   single-pillar groups). Web, Brand & Publishing spans two pillars
   (Technology + Creative) — it was assigned the Technology/"tech" sky
   blue as a normal design decision, not run past you. Flag if you'd
   rather see it distinct from both source pillars.

---

## 6. Recommended Phase 2 scope

Per CLAUDE.md's phased workflow, Phase 2 should cover **2D/3D motion**
(the phase after content/IA), building on this phase's IA and design-
system foundation:

- **Performance budget for Phase 2 3D work** (proposed, pending the
  clean-environment Lighthouse re-run in Open Issue #1 to validate the
  starting baseline):
  - Critical-path JS (everything that loads before any 3D scene lazy-
    imports): **≤150KB gzipped**.
  - Each Level 1 3D scene chunk (lazy-loaded, one per scene family per
    3D_ART_DIRECTION.md): **≤80KB gzipped**, dynamically imported only
    when its section enters the viewport (existing `onVisibilityChange`
    pattern already does this — keep it).
  - **LCP ≤2.5s on mobile** (Lighthouse mobile preset or a real mid-
    range Android), **≤1.5s on desktop**.
  - **TBT ≤200ms on mobile.**
  - **CLS ≤0.1** everywhere (already true across every page measured
    this phase).
  - Sustain **≥30fps** on a mid-range mobile GPU class (e.g., 2021-era
    Adreno 618/619) for any actively-rendering 3D scene; fall back to
    the existing static-image/no-motion path below that, and always
    respect `prefers-reduced-motion` (already wired sitewide).
- Homepage hero **visual** redesign (copy was already updated this
  phase per Task 10 — visuals were explicitly out of scope here).
- The Infrastructure category's promised "immersive interactive 3D"
  treatment (per the 3D policy in this phase's brief) — the 3 new
  category pages currently use only 2D/CSS layout, matching this
  phase's "don't redesign visuals" constraint.
- Profile and, if needed, stagger `HeroScene` vs. `CapabilitySystem3D`
  on the homepage (Open Issue #2).
