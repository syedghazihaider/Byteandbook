import * as THREE from 'three';
import { createBaseScene, readColorToken, getQualityTier, qualityScale, onTabHidden } from './utils';

export interface SceneHandle {
  start: () => void;
  stop: () => void;
  dispose: () => void;
}

/** Level 1 showcase for eBook & Digital Publishing: an open book built
 *  from hinged cover panels (rotated around Z-axis pivots at the spine)
 *  with a stack of page planes on each side. The pages continuously
 *  riffle in a traveling-wave hinge animation — an ambient "flipping
 *  through" motion rather than a literal single-page turn, matching the
 *  homepage hero's precedent of pure ambient motion (no baked-in text;
 *  the manuscript -> distribution steps stay in the 2D FlowSteps diagram
 *  beneath it). */
export function createBookScene(canvas: HTMLCanvasElement): SceneHandle {
  const { renderer, scene, camera, dispose: disposeBase } = createBaseScene(canvas);
  camera.position.set(0, 2.1, 6.2);
  camera.lookAt(0, 0, 0);

  const ink = readColorToken('--bb-ink-300');
  const signal = readColorToken('--bb-signal-400');
  const ember = readColorToken('--bb-ember-500');

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const light = new THREE.DirectionalLight(0xffffff, 1.1);
  light.position.set(3, 6, 5);
  scene.add(light);

  const group = new THREE.Group();
  scene.add(group);

  const panelW = 1.7;
  const panelD = 2.3;
  const openAngle = 0.32;

  const disposables: { geo: THREE.BufferGeometry; mat: THREE.Material }[] = [];

  function makePanel(color: THREE.Color, thickness: number): THREE.Mesh {
    const geo = new THREE.BoxGeometry(panelW, thickness, panelD);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15 });
    disposables.push({ geo, mat });
    return new THREE.Mesh(geo, mat);
  }

  // Covers: hinge Object3Ds sit at the spine (x=0); each panel is offset
  // within its hinge so rotating the hinge around Z tilts it up like a
  // book cover opened flat on a table.
  const leftCoverHinge = new THREE.Object3D();
  const leftCover = makePanel(ink, 0.06);
  leftCover.position.x = -panelW / 2;
  leftCoverHinge.add(leftCover);
  leftCoverHinge.rotation.z = openAngle;
  group.add(leftCoverHinge);

  const rightCoverHinge = new THREE.Object3D();
  const rightCover = makePanel(ink, 0.06);
  rightCover.position.x = panelW / 2;
  rightCoverHinge.add(rightCover);
  rightCoverHinge.rotation.z = -openAngle;
  group.add(rightCoverHinge);

  // Spine accent.
  const spineGeo = new THREE.BoxGeometry(0.1, 0.14, panelD);
  const spineMat = new THREE.MeshStandardMaterial({ color: ember, roughness: 0.4, metalness: 0.3 });
  disposables.push({ geo: spineGeo, mat: spineMat });
  group.add(new THREE.Mesh(spineGeo, spineMat));

  const tier = getQualityTier();
  const pageCount = Math.max(6, Math.round(16 * qualityScale(tier)));
  const pageHinges: THREE.Object3D[] = [];

  for (let i = 0; i < pageCount; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const hinge = new THREE.Object3D();
    const page = makePanel(signal.clone().lerp(new THREE.Color(0xffffff), 0.55), 0.012);
    page.position.x = (side * panelW) / 2 - side * 0.03;
    page.scale.set(0.96, 1, 0.94);
    hinge.add(page);
    hinge.position.y = 0.04 + i * 0.006;
    group.add(hinge);
    pageHinges.push(hinge);
  }

  let frameId = 0;
  let running = false;
  const clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    group.position.y = Math.sin(t * 0.6) * 0.06;
    group.rotation.y = Math.sin(t * 0.12) * 0.25;

    pageHinges.forEach((hinge, i) => {
      const wave = Math.sin(t * 0.9 - i * 0.35);
      hinge.rotation.z = wave * openAngle * 0.92;
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
    dispose() {
      running = false;
      cancelAnimationFrame(frameId);
      stopForTab();
      disposables.forEach(({ geo, mat }) => {
        geo.dispose();
        mat.dispose();
      });
      disposeBase();
    },
  };
}
