import * as THREE from 'three';
import { createBaseScene, readColorToken, getQualityTier, qualityScale, onTabHidden } from './utils';

export interface SceneHandle {
  start: () => void;
  stop: () => void;
  dispose: () => void;
  /** Highlights the node at `index` (pulses scale + shifts to the ember
   *  accent), or clears the highlight when null. Wired to the homepage
   *  service card grid's hover/focus so the backdrop reads as one
   *  interactive system rather than a static ring. */
  setActive: (index: number | null) => void;
}

/** Homepage services section backdrop: a tilted ring of nodes, one per
 *  service, sitting behind the card grid. Distinct silhouette from the
 *  hero's packed sphere cloud — flat and orbital, matching the
 *  "capability system" concept of many disciplines arranged around one
 *  practice. */
export function createCapabilityScene(canvas: HTMLCanvasElement, count: number): SceneHandle {
  const { renderer, scene, camera, dispose: disposeBase } = createBaseScene(canvas);
  camera.position.set(0, 2.4, 7.4);
  camera.lookAt(0, 0, 0);

  const signal = readColorToken('--bb-signal-400');
  const ember = readColorToken('--bb-ember-500');
  const ringSegments = Math.max(48, Math.round(96 * qualityScale(getQualityTier())));

  const group = new THREE.Group();
  scene.add(group);

  const radius = 3.4;
  const ringPts: THREE.Vector3[] = [];
  for (let s = 0; s <= ringSegments; s++) {
    const a = (s / ringSegments) * Math.PI * 2;
    ringPts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
  const ringMat = new THREE.LineBasicMaterial({ color: signal, transparent: true, opacity: 0.14 });
  group.add(new THREE.Line(ringGeo, ringMat));

  const n = Math.max(count, 1);
  const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const nodeMats: THREE.MeshBasicMaterial[] = [];
  const nodes: THREE.Mesh[] = [];
  const baseScales: number[] = [];

  for (let i = 0; i < n; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: signal });
    nodeMats.push(mat);
    const mesh = new THREE.Mesh(nodeGeo, mat);
    const angle = (i / n) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    group.add(mesh);
    nodes.push(mesh);
    baseScales.push(1);
  }

  let activeIndex: number | null = null;
  const targetScales = new Array(n).fill(1);

  let frameId = 0;
  let running = false;
  const clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    group.rotation.y = t * 0.05;

    nodes.forEach((mesh, i) => {
      const target = activeIndex === i ? 1.9 : 1;
      targetScales[i] += (target - targetScales[i]) * 0.15;
      mesh.scale.setScalar(targetScales[i]);
      const mat = nodeMats[i];
      mat.color.copy(activeIndex === i ? ember : signal);
    });

    renderer.render(scene, camera);
  }

  const stopForTab = onTabHidden(
    () => {
      running = false;
      cancelAnimationFrame(frameId);
    },
    () => {
      if (!running) {
        running = true;
        animate();
      }
    }
  );

  return {
    start() {
      if (running) return;
      running = true;
      animate();
    },
    stop() {
      running = false;
      cancelAnimationFrame(frameId);
    },
    setActive(index: number | null) {
      activeIndex = index;
    },
    dispose() {
      running = false;
      cancelAnimationFrame(frameId);
      stopForTab();
      ringGeo.dispose();
      ringMat.dispose();
      nodeGeo.dispose();
      nodeMats.forEach((m) => m.dispose());
      disposeBase();
    },
  };
}
