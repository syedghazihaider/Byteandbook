import * as THREE from 'three';
import { createBaseScene, readColorToken, getQualityTier, qualityScale, onTabHidden } from './utils';

export interface SceneHandle {
  start: () => void;
  stop: () => void;
  dispose: () => void;
  /** t in [0,1] — scrubbed by GSAP ScrollTrigger as the hero section
   *  scrolls past. Drives the camera dolly-out + fade that hands off to
   *  the pillars section below, so the hero reads as one continuous
   *  scene rather than a static canvas that scroll simply passes over. */
  setScrollProgress: (t: number) => void;
}

/** Homepage hero: an abstract "systems network" — a constellation of
 *  nodes and connecting lines standing in for the interconnected
 *  disciplines (growth / technology / infrastructure / creative) the
 *  homepage describes. Slow autorotation plus subtle pointer parallax,
 *  a near/far depth split for real dimensionality, and a scroll-scrubbed
 *  camera dolly. No text/logos baked in, kept abstract on purpose. */
export function createHeroScene(canvas: HTMLCanvasElement): SceneHandle {
  const { renderer, scene, camera, dispose: disposeBase } = createBaseScene(canvas);
  const baseZ = 9;
  camera.position.z = baseZ;

  const tier = getQualityTier();
  const scale = qualityScale(tier);

  const signal = readColorToken('--bb-signal-400');
  const ember = readColorToken('--bb-ember-500');
  const bg = readColorToken('--bb-ink-950');
  scene.fog = new THREE.FogExp2(bg.getHex(), 0.055);

  const group = new THREE.Group();
  scene.add(group);

  function buildLayer(count: number, radius: number, spread: number, pointSize: number, opacity: number) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = radius * (0.55 + Math.random() * 0.45);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * spread;
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: signal,
      size: pointSize,
      transparent: true,
      opacity,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    group.add(points);
    return { positions, geo, mat, points };
  }

  // Near layer: the primary constellation, with connecting lines.
  const near = buildLayer(Math.round(130 * scale), 5.2, 0.62, 0.06, 0.9);
  // Far layer: sparser, dimmer, no lines — pure depth cue behind the fog.
  const far = buildLayer(Math.round(70 * scale), 9.5, 0.75, 0.045, 0.35);
  far.points.position.z = -6;

  // A handful of larger ember-accented nodes on the near layer —
  // restrained secondary accent, matching the "used sparingly" rule.
  const emberGeo = new THREE.SphereGeometry(0.09, 12, 12);
  const emberMat = new THREE.MeshBasicMaterial({ color: ember });
  const emberCount = Math.max(3, Math.round(6 * scale));
  for (let i = 0; i < emberCount; i++) {
    const idx = Math.floor(Math.random() * (near.positions.length / 3));
    const mesh = new THREE.Mesh(emberGeo, emberMat);
    mesh.position.set(near.positions[idx * 3], near.positions[idx * 3 + 1], near.positions[idx * 3 + 2]);
    group.add(mesh);
  }

  // Constellation lines between nearby near-layer points only.
  const linePositions: number[] = [];
  const maxDist = 1.55;
  const maxLinksPerPoint = 3;
  const nearCount = near.positions.length / 3;
  for (let i = 0; i < nearCount; i++) {
    let links = 0;
    for (let j = i + 1; j < nearCount && links < maxLinksPerPoint; j++) {
      const dx = near.positions[i * 3] - near.positions[j * 3];
      const dy = near.positions[i * 3 + 1] - near.positions[j * 3 + 1];
      const dz = near.positions[i * 3 + 2] - near.positions[j * 3 + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < maxDist) {
        linePositions.push(
          near.positions[i * 3], near.positions[i * 3 + 1], near.positions[i * 3 + 2],
          near.positions[j * 3], near.positions[j * 3 + 1], near.positions[j * 3 + 2]
        );
        links++;
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lineMat = new THREE.LineBasicMaterial({ color: signal, transparent: true, opacity: 0.12 });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);

  let targetRotX = 0;
  let targetRotY = 0;
  const onPointerMove = (e: PointerEvent) => {
    targetRotY = ((e.clientX / window.innerWidth) * 2 - 1) * 0.25;
    targetRotX = ((e.clientY / window.innerHeight) * 2 - 1) * 0.15;
  };
  window.addEventListener('pointermove', onPointerMove);

  let scrollT = 0;

  let frameId = 0;
  let running = false;
  const clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    group.rotation.y += (targetRotY + t * 0.045 - group.rotation.y) * 0.03;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.03;

    // Scroll dolly: camera pulls back and the whole constellation fades
    // as the hero hands off to the pillars section beneath it.
    camera.position.z = baseZ + scrollT * 6;
    const fade = 1 - scrollT;
    near.mat.opacity = 0.9 * fade;
    lineMat.opacity = 0.12 * fade;
    far.mat.opacity = 0.35 * fade;
    group.position.y = -scrollT * 1.2;

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
    setScrollProgress(t: number) {
      scrollT = Math.min(1, Math.max(0, t));
    },
    dispose() {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      stopForTab();
      near.geo.dispose();
      near.mat.dispose();
      far.geo.dispose();
      far.mat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      disposeBase();
    },
  };
}
