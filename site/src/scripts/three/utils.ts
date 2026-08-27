import * as THREE from 'three';

export interface BaseScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  resize: () => void;
  dispose: () => void;
}

/** Shared renderer/camera/resize/dispose scaffolding so every Level 1
 *  scene handles performance and cleanup the same way instead of each
 *  reimplementing it: capped pixel ratio, disposed geometries/materials/
 *  textures on teardown, and a ResizeObserver tied to the canvas's
 *  actual container rather than the window (so scenes size correctly
 *  inside cards/sections, not just full-bleed heroes). */
export function createBaseScene(canvas: HTMLCanvasElement): BaseScene {
  const container = canvas.parentElement ?? canvas;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 8;

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const dispose = () => {
    resizeObserver.disconnect();
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
        obj.geometry?.dispose();
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        materials.forEach((m) => m?.dispose());
      }
    });
    renderer.dispose();
  };

  return { renderer, scene, camera, resize, dispose };
}

/** Reads the design tokens directly from computed CSS so 3D scenes stay
 *  in sync with tokens.css instead of hardcoding a second copy of the
 *  palette in TypeScript. */
export function readColorToken(varName: string): THREE.Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return new THREE.Color(value || '#3866f0');
}

/** Minimal hand-rolled drag-to-rotate (no OrbitControls import — keeps
 *  bundle small and avoids depending on three's examples/jsm subpath).
 *  Calls onChange(deltaX, deltaY) in normalized-ish pixel deltas while
 *  the pointer is down over `el`. */
export function addDragRotate(
  el: HTMLElement,
  onChange: (deltaX: number, deltaY: number) => void
): () => void {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    el.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    onChange(e.clientX - lastX, e.clientY - lastY);
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const onUp = (e: PointerEvent) => {
    dragging = false;
    el.releasePointerCapture(e.pointerId);
  };

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);

  return () => {
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onUp);
  };
}
