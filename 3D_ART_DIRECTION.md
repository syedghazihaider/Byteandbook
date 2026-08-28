# ByteAndBook — Full 3D Experience: Art Direction & Scene Architecture

Date: 2026-08-27
Branch: `feature/full-3d-experience`
Base: `e411374` (Astro CLI + static CSS pipeline — unchanged by this work).

## 1. Visual concept: "Systems Constellation"

The existing Phase 7 hero (`heroScene.ts`) already established the core
motif — an abstract constellation of nodes and connecting lines standing
in for interconnected systems. This branch extends that one motif into a
full family rather than introducing a second, competing visual language.

Every scene family below is built from the same primitives (points,
lines/tubes, low-poly meshes, the "Obsidian & Signal" token palette read
live from CSS custom properties) so the site reads as one coherent system
moving through different states — not eleven different demos.

Silhouette differentiates each family, not new colors or materials:

| Family | Silhouette | Motion | Used on |
|---|---|---|---|
| Hero constellation | Sphere-packed node cloud | Slow autorotate + pointer parallax + scroll-scrubbed camera dolly | Homepage hero |
| Capability system | Flat ring of nodes | Idle rotation; hovered card pulses/brightens its node | Homepage services section |
| Infrastructure network | Linear curved pipeline (tube + nodes) | Gentle sway; DevOps adds a traveling pulse | Web Dev, Software Dev, DevOps, Cloud |
| Data ecosystem | Orbiting rings around a central hub | Rings rotate at different speeds, particles drift along them | Digital Marketing, SEO, GEO, Social Media |
| Exploded hardware | Labeled primitive assembly | Drag-to-rotate; explode/assemble toggle | Computer Hardware |
| Dimensional branding | Ascending helix of low-poly facets | Slow rotation + hue sweep across the token palette | Branding |
| Publishing environment | Hinged book + page stack | Idle bob + looping page-turn | eBook & Digital Publishing |
| Ambient field | Sparse, static-camera point drift | Very slow, no lines, no pointer parallax | About, Contact |

## 2. Shared system (`site/src/scripts/three/`)

- `utils.ts` — base scene scaffolding (unchanged contract: renderer/
  camera/resize/dispose), plus new in this branch:
  - `getQualityTier()` — reads `navigator.hardwareConcurrency` /
    `deviceMemory` to scale particle/segment counts on capable desktops
    vs. modest ones. Independent of the existing mobile/reduced-motion
    cutoff in `motion.ts`, which still short-circuits to a static
    fallback below 768px or under `prefers-reduced-motion`.
  - `onTabHidden()` — pauses/resumes a running scene when the browser
    tab itself is backgrounded (`visibilitychange`), on top of the
    existing viewport `IntersectionObserver` pausing.
- `motion.ts` — unchanged; remains the single place that decides whether
  heavy motion runs at all.
- Every scene module still returns the same `{ start, stop, dispose }`
  handle shape (some add scene-specific methods: `setExploded`,
  `setScrollProgress`, `setActive`) so the mount/unmount wiring pattern
  in each `.astro` wrapper stays identical across the whole site.

## 3. Non-negotiables carried into every new scene

- No text is ever baked into a canvas — flow-step labels are real DOM
  elements positioned via projected screen coordinates (the pattern
  already used in `NodeGraph3D`/`HardwareExplode3D`), so screen readers,
  find-in-page, and SEO crawlers see real text regardless of WebGL.
- `shouldRunHeavyMotion()` gates every mount; the static CSS backdrop
  underneath is the fallback, never a blank canvas.
- `onVisibilityChange()` mounts/unmounts based on viewport intersection;
  `onTabHidden()` additionally stops the render loop when the tab isn't
  visible.
- All geometries/materials are disposed on unmount; renderer pixel ratio
  is capped at 2.
- No external 3D model assets — everything is procedural/primitive
  geometry, consistent with the existing hardware scene's approach.

## 4. Content mapping

Reuses the flow-step data already defined per service in
`src/content/services/*.md` — no new content decisions required, only
new renderers for data that already exists.
