// Shared motion utilities — one place to satisfy the accessibility and
// mobile rules (prefers-reduced-motion, lighter mobile experiences)
// rather than every animation component re-implementing the checks.

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Below this width, Level 1 3D scenes render a static fallback instead
 *  of a scaled-down desktop scene, per the mobile rule. */
export function isCompactViewport(): boolean {
  return window.innerWidth < 768;
}

export function shouldRunHeavyMotion(): boolean {
  return !prefersReducedMotion() && !isCompactViewport();
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
