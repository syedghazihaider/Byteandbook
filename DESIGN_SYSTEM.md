# ByteAndBook — Phase 4 Design System

Date: 2026-08-27
Status: Foundation implemented and build-verified. No public pages built
yet (Homepage is Phase 5).

## Direction: "Obsidian & Signal"
A graphite/near-black neutral base (not pure black — retains a touch of
cool depth) with **one dominant, precise accent** (signal blue — trust
and technology) and **one restrained secondary accent** (ember — growth
and energy, used sparingly, never as a base color).

This deliberately moves away from the old `index.html`'s indigo→teal
gradient treatment, which is the exact visual signature of countless
generic AI-template and Fiverr-tier agency sites (explicitly ruled out
by CLAUDE.md's objective). Premium/technical credibility here comes from
restraint, contrast, and motion — not from gradient-heavy decoration.

## Color
Full scale defined in `site/src/styles/tokens.css`:
- **Neutral (ink):** 11-step graphite scale, `ink-950` (background) →
  `ink-50` (near-white text).
- **Signal (primary accent):** 5-step blue scale, used for CTAs, links,
  active states, focus rings.
- **Ember (secondary accent):** 3-step warm amber scale — reserved for
  rare emphasis (a badge, an icon accent, a highlight moment), not
  general UI chrome.

Semantic aliases (`--bb-bg`, `--bb-text`, `--bb-border`, etc.) sit on top
of the raw scale so components reference roles, not literal shades.

## Typography
- **Display/headings:** Sora Variable — geometric, confident, technical
  without being a cliché "startup" font.
- **Body:** Inter Variable — proven readability at small sizes.
- Both self-hosted via `@fontsource-variable/*` (no Google Fonts CDN
  request at runtime — one less external dependency, faster first paint).
- Fluid type scale (`--bb-text-xs` … `--bb-text-5xl`) uses `clamp()` so
  headline sizes respond smoothly across viewport widths instead of
  jumping at breakpoints.

## Components implemented (`site/src/components/ui/`)
- `Container.astro` — max-width page wrapper.
- `Button.astro` — primary / outline / ghost variants, CSS-only hover/
  focus micro-interactions (Level 3).
- `Card.astro` — elevation + hover lift, used as the base for service/
  feature cards.
- `SectionHeading.astro` — eyebrow + heading pattern used consistently
  across sections.

## Verification performed this phase
- `astro build` completed successfully, static output confirmed
  (`dist/`), sitemap integration ran without error.
- `astro preview` served the internal `/style-guide` page; verified via
  HTTP request that it returns 200 and renders the expected content.
- Visual/browser screenshot verification was **not** possible this
  session — the Chrome automation extension was not connected. The
  preview server was left running locally
  (`http://localhost:4321/style-guide/`) so you can review it directly;
  stop it with `astro preview stop` from `site/` when done.

## Not yet decided/built (later phases)
- No homepage or service-page content/layout yet (Phase 5–6).
- No Level 1/2 animation components built yet (Phase 7) — only the CSS-
  level Button/Card micro-interactions exist so far.
- Logo/wordmark treatment not designed — current pages have no branding
  mark yet, only typographic name usage.
