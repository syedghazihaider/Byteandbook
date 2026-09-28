# ByteAndBook — Permanent Project Instructions

Read this file first at the start of every session and follow it. These are
standing instructions — do not ask the user to repeat them.

## PROJECT
ByteAndBook
Domain: https://byteandbook.com

## CURRENT VERIFIED ENVIRONMENT (updated 2026-09-27)
- Namecheap Stellar Shared Hosting, cPanel, LiteSpeed web server. Reach
  cPanel only via Namecheap → Hosting List → cPanel (direct cPanel login
  does not work for this account).
- Live document root: `/home/bytesbra/public_html`
- Live site = the static build of `site/` (Astro 5), uploaded manually as a
  zip of `site/dist/` and extracted over `public_html`. `main` matches live.
- Stack: Astro 5 static output, Tailwind 3 (compiled by the standalone CLI,
  not Vite), Three.js + GSAP (lazy-loaded), self-hosted Inter/Sora fonts,
  GA4 (G-EEQFCCDHDR, loaded after page load).
- Two small PHP endpoints are live: `api/project-request.php` (Start
  Project form, sends mail) and `api/chat.php` (AI assistant via Gemini;
  key read from `/home/bytesbra/.byteandbook/gemini.key`, outside
  public_html). No WordPress runtime, no database connection.
- `public_html/.htaccess` ships from `site/public/.htaccess`: www→apex and
  index.html redirects, 404 page, no directory listings, cache headers.
  HTTP→HTTPS is done at server level (not the cPanel toggle, which is off).
- `bytesbra_wp928.sql` is an **orphaned legacy WordPress database** and must
  NOT be imported, modified, connected, or deleted.
- No login/signup/cart. `/checkout/` is a payment page for existing order
  references only (`noindex`, and excluded from the sitemap).

## SERVER SAFETY
Never overwrite or delete:
- `/home/bytesbra/public_html/.well-known`
- SSL validation files inside `.well-known`
- `/home/bytesbra/byteandbook-backup-2026-08-26.zip`
- the legacy database, unless explicitly approved

SSL is already repaired. Do not modify SSL configuration.

## PRODUCTION DEPLOYMENT
Production deployment is **NOT allowed** until the user explicitly approves
it. Build and test locally/staging first. When deployment is eventually
approved, deploy only production website files to
`/home/bytesbra/public_html` and preserve `.well-known`.

## MAIN OBJECTIVE
Completely rebuild ByteAndBook into a premium international-standard
Digital Technology & Growth Agency website.

The site must feel: premium, futuristic, professional, trustworthy,
interactive, sophisticated, commercially credible, technologically advanced.

It must NOT feel like: a generic template, Fiverr-style agency website,
gaming site, amateur portfolio, or generic AI-generated landing page.

## CREATIVE REFERENCES
Study for inspiration only — never copy their source code, assets,
branding, text, or exact layouts:
1. https://lusion.co/ — 3D/WebGL, scroll storytelling, premium interaction
2. https://unseen.co/ — experimental interaction, immersive creativity, motion
3. https://locomotive.ca/en — typography, layout, usability, scrolling,
   professional agency UX
4. https://www.rejouice.com/ — business professionalism, credibility,
   conversion, commercial presentation

## BYTEANDBOOK SERVICES
Organize services logically around Growth, Technology, Infrastructure and
Creative:
- Digital Marketing
- SEO
- GEO / Generative Engine Optimization
- Social Media Marketing
- Web Development
- Software Development
- DevOps
- Cloud Services
- Computer Hardware
- Branding / Logo Design
- eBook / Digital Publishing

Every important service should have its own SEO-friendly page.

## CORE DESIGN RULE
Do NOT create conventional service pages consisting mainly of:
image + title + paragraph + button.

Services should be explained visually through meaningful 2D/3D animation and
interactive storytelling.

## ANIMATION STRATEGY

**Level 1 — Premium 3D.** Use selectively for: homepage hero, Cloud,
DevOps, Computer Hardware, major showcase areas.

**Level 2 — 2D/SVG/interactive diagrams.** Use primarily for: Digital
Marketing, SEO, GEO, Social Media Marketing, software architecture,
workflows.

**Level 3 — Micro-interactions.** Use for: navigation, buttons, typography,
cards, page transitions, hover states.

Possible technologies: Three.js, WebGL/WebGPU where appropriate, GSAP,
ScrollTrigger, SVG, Canvas, CSS animation.

Animations must explain the service, not exist only as decoration.

## SERVICE VISUAL CONCEPTS
- **Digital Marketing:** Audience → Campaign → Ads → Landing Page →
  Conversion → Analytics → Growth
- **SEO:** Website → Crawler → Index → Search Results → Ranking → Organic
  Traffic → Leads
- **GEO:** Business Information → Structured Content → Entity Understanding
  → AI/LLM → AI Search → Citation/Recommendation → Customer
- **Social Media:** Content → Distribution → Engagement → Audience → Leads
  → Analytics
- **Web Development:** Idea → Wireframe → UI → Code → Browser → Responsive
  Devices → Deployment
- **Software Development:** Frontend ↔ API ↔ Backend ↔ Database → Testing
  → Deployment → Users → Monitoring
- **DevOps:** Developer → Git → Build → Tests → Docker → Registry →
  Kubernetes → Production → Monitoring
- **Cloud:** Users → DNS → Load Balancer → Servers → Application →
  Database/Storage → Monitoring
- **Computer Hardware:** Interactive/exploded 3D workstation showing CPU,
  GPU, RAM, SSD, motherboard, cooling, PSU and networking.
- **Branding:** Idea → Sketch → Geometry → Typography → Color → Logo →
  Brand System
- **eBook:** Manuscript → Editing → Layout → Cover → eBook → Distribution

## CONTENT INTEGRITY
Never fabricate: team members, customers, portfolio projects, testimonials,
awards, ratings, sales, case-study results.

The old source contains possible placeholder/demo names, ratings, products
and stock imagery — do not assume they are genuine. Remove or clearly
replace unverified material.

## LOGIN / CART
The initial redesigned agency website does NOT require login/signup/
cart/checkout unless the user explicitly requests e-commerce/customer
accounts later.

## CONTACT
Create a professional project inquiry experience. Do not pretend a form
works if no backend/email integration is configured. Clearly document any
required integration.

## ARCHITECTURE
Do not keep the redesigned website as one massive HTML file. Choose a
clean, maintainable architecture compatible with Namecheap shared hosting.
A modern static build system is allowed if justified. Prefer production
output that can ultimately be uploaded as static files into `public_html`.
Do not introduce a heavy framework unnecessarily.

## SEO
Implement: unique titles, meta descriptions, canonical URLs, proper
H1/H2/H3 structure, semantic HTML, internal linking, Open Graph,
`sitemap.xml`, `robots.txt`, clean URLs, structured data, accessibility.

## STRUCTURED DATA
Use valid schema when appropriate: Organization, WebSite, Service,
BreadcrumbList, FAQPage (only where genuine visible FAQs exist).

## GEO (Generative Engine Optimization)
Make ByteAndBook easy for AI/search systems to understand through: clear
entity definition, service definitions, FAQs, semantic content, internal
linking, factual explanations, structured data.

## PERFORMANCE
3D must not destroy website speed. Use: lazy loading, dynamic loading,
optimized models, optimized textures, code splitting, appropriate model
compression, reduced particles/shaders on weaker devices, disposal of
unused WebGL resources.

## MOBILE
Do not simply shrink desktop 3D. Create lighter mobile experiences/
fallbacks where necessary.

## ACCESSIBILITY
Support: keyboard navigation, focus states, semantic HTML, appropriate
labels, `prefers-reduced-motion`, sufficient contrast.

## DEVELOPMENT WORKFLOW — CONTROLLED PHASES
1. Audit
2. Architecture
3. Git baseline
4. Design system
5. Homepage
6. Individual service pages
7. 2D/3D motion
8. Content
9. SEO/GEO
10. Responsive/accessibility
11. Performance optimization
12. Testing
13. Staging build
14. Production deployment — only after explicit approval

Do not skip ahead to a later phase without the user's go-ahead.

## GIT
Before development: initialize Git if needed, preserve the original
recovered website, create a baseline commit, use logical commits during
development, never push publicly without permission.

## AUTONOMY
Make normal technical/design decisions independently. Do not ask about
every small implementation choice. Ask only when a genuine business
decision is required.

## TOOLING & DEPENDENCIES
Before starting implementation, inspect the current environment and
determine which packages, CLI tools, browser/testing tools, libraries,
skills, or integrations are genuinely required for this project.

- Install only necessary local development dependencies automatically when
  safe.
- Prefer existing installed tools whenever possible.
- Do not install unnecessary tools, MCP servers, skills, or connectors.
- If an installation requires account authentication, credentials, API
  keys, payment, external service authorization, system-wide changes, or
  could affect production, ask the user first.

## FILE INVENTORY (as of 2026-09-27)
The old single-file site (`index.html`, `byteandbook github.txt`) is no
longer in the repo; it survives only inside
`byteandbook-backup-2026-08-26.zip`.

**Source — `site/` (Astro 5 project; run everything from here)**
- `src/pages/` — one `.astro` file per route: `index`, `about`, `process`,
  `work`, `case-studies`, `insights`, `contact`, `privacy`, `terms`,
  `refund-policy`, `checkout`, `404`, `style-guide` (noindex); plus
  `services/index`, the three category pages (`growth-ai-discovery`,
  `web-brand-publishing`, `infrastructure-automation`) and `[slug].astro`
  for the 11 individual services.
- `src/content/services/*.md` — the 11 service pages' content (single
  source of truth, also read by the chatbot knowledge build).
- `src/data/` — `anonymizedCaseStudies.ts` (the 4 real case studies, read
  by `/case-studies/` and `/work/`), `caseStudies.ts` (future named-client
  entries, empty), `leadership.ts` (empty).
- `src/layouts/BaseLayout.astro` — every page's `<head>`: title, meta,
  canonical, OG/Twitter, Organization/WebSite JSON-LD, font preloads, the
  deferred GA4 loader.
- `src/components/` — `layout`, `ui`, `three` (3D scenes), `diagrams`
  (2D FlowSteps), `chat`, `project` (Start Project modal), `trust`,
  `legal`, `checkout`, `insights`.
- `src/scripts/` — `motion.ts` (reduced-motion, compact-viewport and
  load+idle gates for 3D), `three/*` (scene code), `chatbot.ts`.
- `src/styles/global.css` — design tokens, self-hosted `@font-face` +
  metric-matched fallback faces, Tailwind input.
- `src/config/site.ts` (verified social URLs), `src/lib/` (categories,
  legal version, pillar colors), `src/generated/` (build output, ignored).
- `public/` — copied as-is into the build: `.htaccess`, `robots.txt`,
  `favicon.svg`, `og-default.jpg`, `brand/logo.jpg` (square master logo),
  `fonts/` (Inter/Sora latin woff2 + OFL licences), `api/*.php`, the
  IndexNow key file `87d4b1f75ad953141401e3595ed2dd6a.txt`. Checked out
  with LF line endings (`.gitattributes`) so builds are reproducible.
- `scripts/` — `hash-css.mjs` and `build-chat-knowledge.mjs` (part of
  `npm run build`), `qa-check.mjs` (`npm test`, ~1,980 assertions — run
  after every build), `indexnow.mjs` (`npm run indexnow`, dry run unless
  `--submit`; only after a deploy is live), `package-deploy.mjs`
  (`npm run package -- --name <x> --previous <live zip>`: builds the
  deploy zip plus `<x>-delete-after-deploy.txt`, the stale files to move
  to cPanel trash after the upload is verified).
- `site/*deploy*.zip`, `site/*-delete-after-deploy.txt` — past deploy
  packages and their delete lists (gitignored). The zip that is live is
  the rollback copy and the `--previous` for the next `npm run package`.

**Docs (repo root)** — `ARCHITECTURE.md`, `AUDIT.md`, `DESIGN_SYSTEM.md`,
`3D_ART_DIRECTION.md`, `DEPLOYMENT_PLAN.md`, `docs/` (Phase 1 report and
deploy instructions). Some predate the Astro rebuild; verify against the
code before relying on them.

**Legacy — never modify or delete**
- `bytesbra_wp928.sql` — orphaned legacy WordPress database dump
  (`bytesbra_wp928`, table prefix `wpfq_`). Reference only — never import,
  modify, connect, or delete.
- `byteandbook-backup-2026-08-26.zip` — backup of the old single-file
  site. Never overwrite or delete.
- `byteandbook-backup-pre-phase1-2026-09-22.zip`,
  `byteandbook-deploy-phase1-2026-09-22.zip` — Phase 1 backup/deploy
  archives (untracked).

## STANDING SAFETY RULES (do not repeat each session)
1. Do not modify the site's critical entry points unless the current
   approved phase explicitly calls for it, and always show the diff first:
   `site/public/.htaccess` (a mistake can take the whole site down),
   `site/public/api/chat.php` and `site/public/api/project-request.php`
   (live backend endpoints), `site/src/layouts/BaseLayout.astro` (every
   page's head, schema and analytics), `site/astro.config.mjs` (site URL,
   sitemap), and the IndexNow key file in `site/public/`.
2. Do not modify or delete `byteandbook-backup-2026-08-26.zip`.
3. Do not modify, import, or connect `bytesbra_wp928.sql`.
4. Do not touch `.well-known` or SSL configuration.
5. No production deployment without explicit user approval.
6. Work only within the current phase's explicit scope — do not jump ahead.
