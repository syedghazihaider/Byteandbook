import * as THREE from 'three';
import { createBaseScene, readColorToken, getQualityTier, qualityScale, onTabHidden } from './utils';

export interface SceneHandle {
  start: () => void;
  stop: () => void;
  dispose: () => void;
}

/** Restrained backdrop for About/Contact: a sparse, slow point drift
 *  with no connecting lines, no pointer parallax, and a static camera —
 *  deliberately quieter than the homepage hero constellation so it
 *  never competes with page text or usability on pages that are meant
 *  to read primarily as text. */
export function createAmbientFieldScene(canvas: HTMLCanvasElement): SceneHandle {
  const { renderer, scene, camera, dispose: disposeBase } = createBaseScene(canvas);
  camera.position.z = 8;

  const signal = readColorToken('--bb-signal-400');
  const scale = qualityScale(getQualityTier());

  const count = Math.round(46 * scale);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 11;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: signal,
    size: 0.05,
    transparent: true,
    opacity: 0.45,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let frameId = 0;
  let running = false;
  const clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    points.rotation.y = t * 0.015;
    points.rotation.x = Math.sin(t * 0.05) * 0.05;
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
    dispose() {
      running = false;
      cancelAnimationFrame(frameId);
      stopForTab();
      geo.dispose();
      mat.dispose();
      disposeBase();
    },
  };
}
