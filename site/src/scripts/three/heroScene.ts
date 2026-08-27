import * as THREE from 'three';
import { createBaseScene, readColorToken } from './utils';

export interface SceneHandle {
  start: () => void;
  stop: () => void;
  dispose: () => void;
}

/** Homepage hero: an abstract "systems network" — a constellation of
 *  nodes and connecting lines standing in for the interconnected
 *  disciplines (growth / technology / infrastructure / creative) the
 *  homepage describes. Slow autorotation plus subtle pointer parallax;
 *  no text/logos baked in, kept abstract on purpose. */
export function createHeroScene(canvas: HTMLCanvasElement): SceneHandle {
  const { renderer, scene, camera, dispose: disposeBase } = createBaseScene(canvas);
  camera.position.z = 9;

  const signal = readColorToken('--bb-signal-400');
  const ember = readColorToken('--bb-ember-500');

  const group = new THREE.Group();
  scene.add(group);

  const COUNT = 130;
  const positions = new Float32Array(COUNT * 3);
  const radius = 5.2;
  for (let i = 0; i < COUNT; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = radius * (0.55 + Math.random() * 0.45);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.62;
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pointsMat = new THREE.PointsMaterial({
    color: signal,
    size: 0.06,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(pointsGeo, pointsMat);
  group.add(points);

  // A handful of larger ember-accented nodes — restrained secondary
  // accent, matching the "used sparingly" rule from the design system.
  const emberGeo = new THREE.SphereGeometry(0.09, 12, 12);
  const emberMat = new THREE.MeshBasicMaterial({ color: ember });
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * COUNT);
    const mesh = new THREE.Mesh(emberGeo, emberMat);
    mesh.position.set(positions[idx * 3], positions[idx * 3 + 1], positions[idx * 3 + 2]);
    group.add(mesh);
  }

  // Constellation lines between nearby points.
  const linePositions: number[] = [];
  const maxDist = 1.55;
  const maxLinksPerPoint = 3;
  for (let i = 0; i < COUNT; i++) {
    let links = 0;
    for (let j = i + 1; j < COUNT && links < maxLinksPerPoint; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < maxDist) {
        linePositions.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
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

  let frameId = 0;
  let running = false;
  const clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    group.rotation.y += (targetRotY + t * 0.045 - group.rotation.y) * 0.03;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.03;
    renderer.render(scene, camera);
  }

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
      window.removeEventListener('pointermove', onPointerMove);
      pointsGeo.dispose();
      pointsMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      disposeBase();
    },
  };
}
