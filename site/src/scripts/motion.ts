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

/** Stricter than shouldRunHeavyMotion(): Phase 2's homepage hero runs its
 *  real-time interactive scene (mouse attraction, raycasted click-to-
 *  navigate) only on desktop-class viewports. Compact/mobile viewports
 *  fall back to the hero's existing static gradient/grid backdrop
 *  instead of any WebGL at all — genuinely lighter, not just a lower-
 *  quality tier. Every other Level 1 scene is untouched and keeps
 *  running WebGL at the compact quality tier on mobile as before; this
 *  gate is intentionally scoped to the hero only. */
export function shouldRunHeroInteractive3D(): boolean {
  return shouldRunHeavyMotion() && !isCompactViewport();
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

let loadAndIdle: Promise<void> | null = null;

/** Resolves once the page's `load` event has fired and the main thread is
 *  next idle (shared, so every caller waits on the same moment). */
export function afterLoadAndIdle(): Promise<void> {
  if (!loadAndIdle) {
    loadAndIdle = new Promise((resolve) => {
      const whenIdle = () => {
        if ('requestIdleCallback' in window) requestIdleCallback(() => resolve(), { timeout: 3000 });
        else setTimeout(resolve, 200);
      };
      if (document.readyState === 'complete') whenIdle();
      else window.addEventListener('load', whenIdle, { once: true });
    });
  }
  return loadAndIdle;
}

/** Runs `mount()` only once `el` is near the viewport, and `unmount()`
 *  when it leaves — used to pause/dispose WebGL work that's off-screen
 *  rather than burning GPU/battery on canvases the visitor can't see.
 *
 *  Phase 3b: on compact (phone-width) viewports the first mount also
 *  waits for afterLoadAndIdle(), so a scene in the first screen no longer
 *  downloads and boots Three.js while the page is still loading (live
 *  traces: ~2.3 s of simulated-mobile script on /services/seo/). Until
 *  then the scene's box stays empty, exactly as it already did while
 *  Three.js was downloading; service pages' 2D FlowSteps diagram carries
 *  the same labels meanwhile. Desktop is unchanged: mounts as soon as the
 *  element is visible. */
export function onVisibilityChange(
  el: Element,
  mount: () => void,
  unmount: () => void
): () => void {
  let mounted = false;
  let visible = false;
  let ready = !isCompactViewport();

  const sync = () => {
    if (visible && ready && !mounted) {
      mounted = true;
      mount();
    } else if (!visible && mounted) {
      mounted = false;
      unmount();
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) visible = entry.isIntersecting;
      sync();
    },
    { threshold: 0.05 }
  );
  observer.observe(el);

  if (!ready) {
    afterLoadAndIdle().then(() => {
      ready = true;
      sync();
    });
  }
  return () => observer.disconnect();
}
