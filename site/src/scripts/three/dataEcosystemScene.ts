import * as THREE from 'three';
import { createBaseScene, readColorToken, getQualityTier, qualityScale, onTabHidden } from './utils';

export interface ScreenPosition {
  x: number;
  y: number;
  visible: boolean;
}

export interface DataEcosystemOptions {
  steps: string[];
  accentVar?: string;
  onUpdate?: (positions: ScreenPosition[]) => void;
}

export interface SceneHandle {
  start: () => void;
  stop: () => void;
  dispose: () => void;
}

/** Level 1 showcase for the Growth pillar (Marketing / SEO / GEO /
 *  Social): a central hub (the business) with each flow step orbiting
 *  it on its own ring — visually distinct from the Infrastructure
 *  pillar's linear pipeline (nodeGraphScene) while driven by the same
 *  per-service flowSteps data. Viewed from a raised, tilted camera so
 *  the circular orbits read as ellipses — depth without needing heavy
 *  geometry. */
export function createDataEcosystemScene(canvas: HTMLCanvasElement, opts: DataEcosystemOptions): SceneHandle {
  const { renderer, scene, camera, dispose: disposeBase } = createBaseScene(canvas);
  camera.position.set(0, 3.1, 6.4);
  camera.lookAt(0, 0, 0);

  const accent = readColorToken(opts.accentVar ?? '--bb-signal-400');
  const hubColor = readColorToken('--bb-ember-500');
  const ringSegments = Math.max(32, Math.round(64 * qualityScale(getQualityTier())));

  const group = new THREE.Group();
  scene.add(group);

  const hubGeo = new THREE.IcosahedronGeometry(0.42, 1);
  const hubMat = new THREE.MeshBasicMaterial({ color: hubColor, wireframe: true });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  group.add(hub);

  const n = Math.max(opts.steps.length, 1);
  const baseRadius = 1.3;
  const radiusStep = 0.62;

  interface Orbiter {
    mesh: THREE.Mesh;
    radius: number;
    angle: number;
    speed: number;
  }

  const orbiters: Orbiter[] = [];
  const ringGeos: THREE.BufferGeometry[] = [];
  const ringMats: THREE.Material[] = [];
  const particleGeo = new THREE.SphereGeometry(0.1, 16, 16);
  const particleMat = new THREE.MeshBasicMaterial({ color: accent });

  for (let i = 0; i < n; i++) {
    const radius = baseRadius + i * radiusStep;

    const ringPts: THREE.Vector3[] = [];
    for (let s = 0; s <= ringSegments; s++) {
      const a = (s / ringSegments) * Math.PI * 2;
      ringPts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
    const ringMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.16 });
    group.add(new THREE.Line(ringGeo, ringMat));
    ringGeos.push(ringGeo);
    ringMats.push(ringMat);

    const mesh = new THREE.Mesh(particleGeo, particleMat);
    const angle = (i / n) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    group.add(mesh);

    orbiters.push({ mesh, radius, angle, speed: (i % 2 === 0 ? 1 : -1) * (0.18 - i * 0.015) });
  }

  // Dynamic spokes from hub to each orbiter, rebuilt from a single
  // pre-allocated buffer every frame (n is small — flowSteps.length).
  const spokePositions = new Float32Array(n * 2 * 3);
  const spokeGeo = new THREE.BufferGeometry();
  spokeGeo.setAttribute('position', new THREE.BufferAttribute(spokePositions, 3));
  const spokeMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.22 });
  const spokes = new THREE.LineSegments(spokeGeo, spokeMat);
  group.add(spokes);

  const canvasEl = canvas;
  const tmpVec = new THREE.Vector3();
  function computeScreenPositions(): ScreenPosition[] {
    const rect = canvasEl.getBoundingClientRect();
    return orbiters.map((o) => {
      o.mesh.getWorldPosition(tmpVec);
      tmpVec.project(camera);
      return {
        x: (tmpVec.x * 0.5 + 0.5) * rect.width,
        y: (-tmpVec.y * 0.5 + 0.5) * rect.height,
        visible: tmpVec.z < 1,
      };
    });
  }

  let frameId = 0;
  let running = false;
  const clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    frameId = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const t = clock.getElapsedTime();

    hub.rotation.y += dt * 0.25;
    hub.rotation.x += dt * 0.1;
    group.rotation.y = Math.sin(t * 0.08) * 0.15;

    orbiters.forEach((o, i) => {
      o.angle += o.speed * dt;
      o.mesh.position.set(Math.cos(o.angle) * o.radius, 0, Math.sin(o.angle) * o.radius);
      const base = i * 6;
      spokePositions[base] = 0;
      spokePositions[base + 1] = 0;
      spokePositions[base + 2] = 0;
      spokePositions[base + 3] = o.mesh.position.x;
      spokePositions[base + 4] = o.mesh.position.y;
      spokePositions[base + 5] = o.mesh.position.z;
    });
    spokeGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    opts.onUpdate?.(computeScreenPositions());
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
    dispose() {
      running = false;
      cancelAnimationFrame(frameId);
      stopForTab();
      hubGeo.dispose();
      hubMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      spokeGeo.dispose();
      spokeMat.dispose();
      ringGeos.forEach((g) => g.dispose());
      ringMats.forEach((m) => m.dispose());
      disposeBase();
    },
  };
}
