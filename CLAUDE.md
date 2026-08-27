# ByteAndBook — Permanent Project Instructions

Read this file first at the start of every session and follow it. These are
standing instructions — do not ask the user to repeat them.

## PROJECT
ByteAndBook
Domain: https://byteandbook.com

## CURRENT VERIFIED ENVIRONMENT
- Namecheap Stellar Shared Hosting, cPanel.
- Live document root: `/home/bytesbra/public_html`
- Current live site is static.
- Current application source is `index.html`.
- Existing stack: HTML5, inline CSS, Tailwind CDN, vanilla JavaScript,
  Google Fonts, Font Awesome.
- No active PHP application. No active WordPress runtime. No backend/API.
  No active database connection.
- `bytesbra_wp928.sql` is an **orphaned legacy WordPress database** and must
  NOT be imported, modified, connected, or deleted.
- Existing login/signup/cart/checkout functionality is demo-only.
- Existing login/signup stores data in `localStorage` and must NOT be
  retained as production authentication.
- Existing contact form is disabled/demo-only.

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

## FILE INVENTORY (as of 2026-08-27)
- `index.html` — existing static single-page site ("ByteAndBook - Creative
  Agency"), Tailwind CDN + vanilla JS/CSS, no build step. This is the
  current live application source — do not modify except within an
  explicitly approved phase.
- `byteandbook github.txt` — same byte size as `index.html` (85,067 bytes);
  appears to be a copy/export of the same page. Not yet diffed against
  `index.html` — treat as reference until confirmed identical.
- `bytesbra_wp928.sql` — orphaned legacy WordPress database dump
  (`bytesbra_wp928`, table prefix `wpfq_`). Reference only — never import,
  modify, connect, or delete.
- `byteandbook-backup-2026-08-26.zip` — dated backup archive of the prior
  site state. Never overwrite or delete.

## STANDING SAFETY RULES (do not repeat each session)
1. Do not modify `index.html` unless the current approved phase explicitly
   calls for it.
2. Do not modify or delete `byteandbook-backup-2026-08-26.zip`.
3. Do not modify, import, or connect `bytesbra_wp928.sql`.
4. Do not touch `.well-known` or SSL configuration.
5. No production deployment without explicit user approval.
6. Work only within the current phase's explicit scope — do not jump ahead.
