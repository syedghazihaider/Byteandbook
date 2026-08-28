# ByteAndBook — Phase 2 Architecture Decision

Date: 2026-08-27
Status: Decision made, nothing scaffolded yet. No packages installed, no
code written. This document is the Phase 2 deliverable; implementation
starts in later phases per CLAUDE.md's workflow.

## 1. Constraint recap (from CLAUDE.md)
- Must ultimately run as **static files** in `/home/bytesbra/public_html`
  on Namecheap shared hosting — no Node process at runtime, no server-side
  app.
- Must NOT stay one massive HTML file.
- A modern static build system is allowed **if justified**.
- No heavy framework unless necessary.
- Needs many SEO-friendly individual service pages, not one page.
- Needs room for selective heavy interactivity (Three.js/WebGL) without
  hurting performance on pages that don't need it.

## 2. Decision: Astro (static output, island architecture)

**Chosen stack:** [Astro](https://astro.build) as the build tool/framework,
outputting fully static HTML/CSS/JS via `astro build`. No UI framework
(React/Vue/Svelte) is adopted — components are authored in Astro's native
`.astro` format (HTML + scoped CSS + optional vanilla `<script>`), which
avoids pulling in a client-side framework runtime we don't need.

### Why this fits the constraints better than the alternatives considered

| Option | Verdict | Reason |
|---|---|---|
| **Astro** (chosen) | ✅ | Static output by default, ships **zero JS unless a component opts in** (island architecture), file-based routing gives clean SEO URLs per service for free, first-class content collections for structured service data, native support for mixing plain HTML/CSS/JS with selective Three.js/GSAP where needed. |
| Next.js / Nuxt | ❌ | Built around a Node server/SSR model; static export is possible but fights the framework's defaults, pulls in a full React/Vue runtime for every page even when no interactivity is needed — unnecessary weight per "no heavy framework unnecessarily." |
| Eleventy (11ty) | Considered, not chosen | Also static-first and lightweight, but weaker built-in story for scoped component CSS, TypeScript, and mixing islands of interactivity — would need more manual wiring for the 3-level animation strategy. Astro gives the same static-first outcome with better component ergonomics. |
| Plain Vite + hand-rolled multi-page config | Considered, not chosen | Doable, but we'd be manually rebuilding what Astro already gives us (routing, content collections, image optimization, sitemap integration) — reinventing tooling isn't justified here. |
| Keep single static HTML file, just split manually | ❌ | Explicitly ruled out by CLAUDE.md ("do not keep the redesigned website as one massive HTML file") and doesn't solve per-page SEO metadata, content structure, or reuse of diagram/animation components across pages. |
| Rebuild on WordPress | ❌ | CLAUDE.md confirms no active WP runtime and the legacy DB is orphaned; re-introducing WordPress adds a database, PHP runtime, and security surface shared hosting doesn't need for what is fundamentally a marketing/content site with custom interactive components. |

Astro's output is plain static files, so deployment stays exactly what
CLAUDE.md requires: build locally/staging, then upload the `dist/`
contents to `public_html`, preserving `.well-known`.

## 3. Proposed directory structure
```
byteandbook/
  src/
    pages/                     -> file-based routing = clean URLs
      index.astro               (homepage)
      services/
        digital-marketing.astro
        seo.astro
        geo.astro
        social-media-marketing.astro
        web-development.astro
        software-development.astro
        devops.astro
        cloud.astro
        computer-hardware.astro
        branding.astro
        ebook-publishing.astro
      about.astro
      contact.astro
      404.astro
    content/
      services/                -> content collection: one entry per service
        digital-marketing.md    (frontmatter: title, meta description,
                                  category, animation level, summary,
                                  visual-concept steps, canonical slug)
        ... one per service
      config.ts                 -> Zod schema enforcing required SEO
                                    fields on every service entry
    components/
      layout/                  -> Header, Footer, Nav, SEOHead
      diagrams/                -> Level 2 SVG/interactive diagram components
                                    (one per service flow, e.g. SEOFlow.astro)
      three/                   -> Level 1 3D islands (Hero, Cloud, DevOps,
                                    Hardware) — vanilla Three.js modules,
                                    hydrated with client:visible / client:idle
      ui/                      -> buttons, cards, section wrappers
                                    (Level 3 micro-interaction primitives)
    layouts/
      BaseLayout.astro          -> shared <head>, SEO tags, JSON-LD slot
      ServiceLayout.astro       -> shared shell for all service pages
    styles/
      tokens.css                -> design tokens (colors, spacing, type)
      global.css
    scripts/                    -> shared vanilla JS utilities (GSAP setup,
                                    ScrollTrigger registration, reduced-motion
                                    guards)
  public/
    robots.txt
    favicon assets
    (static, unprocessed assets)
  astro.config.mjs
  package.json
```

Every service gets its own route + its own content entry — satisfies
"every important service should have its own SEO-friendly page" directly
through the routing model, not through manual duplication.

## 4. Content model
A `services` content collection (Astro Content Collections, schema-
validated) will hold each service's copy, SEO metadata, and the visual
concept flow steps already defined in CLAUDE.md (e.g. SEO's
Website→Crawler→Index→Search Results→Ranking→Organic Traffic→Leads).
This does two things:
- Forces every service page to have a title, meta description, and
  canonical slug — nothing ships without basic SEO fields (schema
  validation fails the build otherwise).
- Lets diagram components consume the same step data driving the visual
  storytelling, instead of hardcoding flow text separately from the
  animation.

## 5. Styling
Replace the current Tailwind **CDN script** (unsuitable for production —
no purge, ships the whole utility set, external runtime dependency) with
Tailwind installed as a proper build dependency via Astro's official
integration, compiled at build time into a small purged stylesheet.
Design tokens (color system, type scale) live in `tokens.css` so the
"premium/futuristic" visual language (defined in Phase 4) stays consistent
across every page and every diagram/3D component.

## 6. Animation architecture (maps directly to CLAUDE.md's 3 levels)

| Level | Where | Tech | Loading strategy |
|---|---|---|---|
| 1 — Premium 3D | Homepage hero, Cloud page, DevOps page, Computer Hardware page | Vanilla Three.js (no React Three Fiber — avoids pulling in React) | Isolated in `components/three/`, hydrated only via `client:visible` (or `client:idle` for hero) so 3D JS never loads on pages that don't use it |
| 2 — 2D/SVG diagrams | Digital Marketing, SEO, GEO, Social Media, software/DevOps/Cloud flow diagrams | Inline SVG + GSAP/ScrollTrigger | Loaded per-page only; diagram steps driven by the content collection data |
| 3 — Micro-interactions | Nav, buttons, cards, transitions, hover states | CSS transitions/animations first; GSAP only where CSS can't do it | Global lightweight JS, always loaded (small footprint) |

`prefers-reduced-motion` is checked centrally in `scripts/` and short-
circuits Levels 1–2 to static fallbacks — one place to satisfy the
accessibility requirement rather than per-component checks.

## 7. SEO / GEO architecture
- `BaseLayout.astro` renders per-page `<title>`, meta description,
  canonical URL, Open Graph tags, and a JSON-LD slot from each page's
  frontmatter/content-collection entry — no page can accidentally ship
  without these.
- `@astrojs/sitemap` integration generates `sitemap.xml` at build time
  from the actual route list — stays accurate as pages are added.
- `robots.txt` lives in `public/`, hand-maintained (trivial, no generator
  needed).
- Structured data components (`Organization`, `WebSite`, `Service`,
  `BreadcrumbList`, `FAQPage`) live in `components/layout/` and are
  composed per page — `FAQPage` only rendered on pages with genuine
  visible FAQ content, per CLAUDE.md.
- Internal linking: service pages cross-link via the content collection
  (e.g. related-services list), keeping GEO's "clear entity/service
  definition + internal linking" requirement structural rather than
  manual.

## 8. Performance strategy
- Astro ships zero JS by default; every interactive island opts in
  explicitly (`client:visible`, `client:idle`, `client:media` for
  mobile-specific fallbacks).
- Images processed through Astro's built-in image optimization
  (responsive sizes, modern formats) instead of hotlinked/base64 images
  as in the current `index.html`.
- Three.js scenes dispose of WebGL resources on unmount/navigation;
  texture/model sizes budgeted per page during Phase 7/11.
- Per-route code splitting is automatic with Astro's build — a visitor to
  `/services/seo/` never downloads the Three.js bundle used on
  `/services/cloud/`.

## 9. Mobile strategy
Heavy 3D components declare a lighter fallback (reduced particle count/
simplified geometry, or a static illustrated equivalent) selected via
`client:media` / viewport + device-capability checks, rather than just
scaling the desktop 3D scene down — per CLAUDE.md's mobile rule.

## 10. What Phase 2 deliberately does NOT include
- No `npm install`, no `package.json`, no scaffolding — that begins once
  you approve moving into implementation (Phase 3 Git baseline, then
  Phase 4 Design system, per the roadmap).
- No visual/brand decisions (colors, type, tone) — that's Phase 4.
- No content decisions on the unverified team/testimonial/contact data
  flagged in the Phase 1 audit — still pending your confirmation.

## 11. Anticipated dependencies (for transparency — not installed yet)
All standard open-source npm packages, no accounts/API keys/payment
required, so installation (when it happens) will be a routine local dev
dependency install under the TOOLING & DEPENDENCIES rule:
`astro`, `@astrojs/tailwind`, `tailwindcss`, `@astrojs/sitemap`, `three`,
`gsap`.

## 12. Amendment (Phase 4) — Tailwind integration path
When dependencies were actually installed in Phase 4, the latest Astro
(v7) had already dropped compatibility with `@astrojs/tailwind` (capped
at Astro v5) in favor of wiring Tailwind v4 directly as a Vite plugin —
Astro's own current recommended path for Tailwind v4. Adjusted stack:
`@tailwindcss/vite` + `tailwindcss@^4`, configured in `astro.config.mjs`
under `vite.plugins`, with theme tokens defined via Tailwind v4's CSS-
native `@theme` block in `src/styles/global.css` (rather than a
`tailwind.config.mjs` JS file). Functionally equivalent outcome — static
build output, purged CSS, same token source of truth — just a different
wiring mechanism than originally anticipated in Section 5.
