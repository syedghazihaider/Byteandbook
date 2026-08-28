// Shared motion utilities — one place to satisfy the accessibility and
// mobile rules (prefers-reduced-motion, lighter mobile experiences)
// rather than every animation component re-implementing the checks.

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Below this width, scenes run a compact/low-quality motion tier
 *  (see getQualityTier in scripts/three/utils.ts) rather than either the
 *  full desktop scene or a static fallback — real mobile visitors get a
 *  genuine, lighter Three.js experience, not a cut scene. */
export function isCompactViewport(): boolean {
  return window.innerWidth < 768;
}

let webglSupportCache: boolean | null = null;

/** Probes for a real WebGL context once and caches the result. This,
 *  not viewport width, is what decides whether 3D runs at all — a small
 *  screen still gets real Three.js (at the compact quality tier); only
 *  no WebGL support gets the static fallback. */
export function isWebglSupported(): boolean {
  if (webglSupportCache !== null) return webglSupportCache;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    webglSupportCache = !!gl;
  } catch {
    webglSupportCache = false;
  }
  return webglSupportCache;
}

export function shouldRunHeavyMotion(): boolean {
  return !prefersReducedMotion() && isWebglSupported();
}

/** Runs `create()` and returns its handle, or null if scene construction
 *  throws — a genuine rendering failure (context loss, driver crash,
 *  out of memory) falls back to static rather than leaving a broken
 *  canvas or an uncaught error on the page. */
export function safeMountScene<T>(create: () => T): T | null {
  try {
    return create();
  } catch (err) {
    console.warn('[ByteAndBook] 3D scene failed to initialize — falling back to static.', err);
    return null;
  }
}

/** Level 3 scroll-reveal: fades/slides [data-reveal] elements in once
 *  they enter the viewport. No-ops (reveals immediately) under
 *  prefers-reduced-motion. */
export function initScrollReveal(root: ParentNode = document): void {
  const targets = root.querySelectorAll<HTMLElement>('[data-reveal]');
  if (targets.length === 0) return;

  if (prefersReducedMotion()) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/** Runs `mount()` only once `el` is near the viewport, and `unmount()`
 *  when it leaves — used to pause/dispose WebGL work that's off-screen
 *  rather than burning GPU/battery on canvases the visitor can't see. */
export function onVisibilityChange(
  el: Element,
  mount: () => void,
  unmount: () => void
): () => void {
  let mounted = false;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !mounted) {
          mounted = true;
          mount();
        } else if (!entry.isIntersecting && mounted) {
          mounted = false;
          unmount();
        }
      }
    },
    { threshold: 0.05 }
  );
  observer.observe(el);
  return () => observer.disconnect();
}
