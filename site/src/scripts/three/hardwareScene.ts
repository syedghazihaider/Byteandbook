import * as THREE from 'three';
import { createBaseScene, readColorToken, addDragRotate, onTabHidden, getQualityTier } from './utils';

export interface ScreenLabel {
  key: string;
  x: number;
  y: number;
  visible: boolean;
  opacity: number;
}

export interface HardwareOptions {
  onUpdate?: (labels: ScreenLabel[]) => void;
}

export interface HardwareHandle {
  start: () => void;
  stop: () => void;
  dispose: () => void;
  setExploded: (exploded: boolean) => void;
}

interface Part {
  key: string;
  mesh: THREE.Mesh;
  assembled: THREE.Vector3;
  exploded: THREE.Vector3;
}

/** Stylized, hand-built exploded workstation — CPU/GPU/RAM/SSD/
 *  motherboard/cooling/PSU/networking as labeled primitive geometry
 *  (no external 3D model assets to source/license). Drag to rotate;
 *  the explode/assemble transition and part labels are driven by the
 *  `setExploded` toggle wired from the Astro component's UI button. */
export function createHardwareScene(canvas: HTMLCanvasElement, opts: HardwareOptions = {}): HardwareHandle {
  const { renderer, scene, camera, dispose: disposeBase } = createBaseScene(canvas);
  camera.position.set(0, 1.2, 8);
  camera.lookAt(0, 0, 0);

  const signal = readColorToken('--bb-signal-400');
  const signalDim = readColorToken('--bb-signal-600');
  const ink = readColorToken('--bb-ink-400');
  const ember = readColorToken('--bb-ember-500');

  const group = new THREE.Group();
  scene.add(group);

  const compact = getQualityTier() === 'compact';
  const coolingSegments = compact ? 16 : 28;

  const light = new THREE.DirectionalLight(0xffffff, 1.1);
  light.position.set(4, 6, 6);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  const disposables: { geo: THREE.BufferGeometry; mat: THREE.Material }[] = [];
  function addPart(key: string, geo: THREE.BufferGeometry, color: THREE.Color, assembled: THREE.Vector3, exploded: THREE.Vector3): Part {
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.35 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(assembled);
    group.add(mesh);
    disposables.push({ geo, mat });
    return { key, mesh, assembled, exploded };
  }

  const parts: Part[] = [
    addPart('Motherboard', new THREE.BoxGeometry(4.2, 0.1, 3.2), ink, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)),
    addPart('CPU', new THREE.BoxGeometry(0.6, 0.14, 0.6), signal, new THREE.Vector3(-0.3, 0.12, 0), new THREE.Vector3(-0.3, 1.1, 0)),
    addPart('Cooling', new THREE.CylinderGeometry(0.45, 0.45, 0.22, coolingSegments), ink, new THREE.Vector3(-0.3, 0.3, 0), new THREE.Vector3(-0.3, 2.0, 0)),
    addPart('RAM', new THREE.BoxGeometry(0.14, 0.85, 1.5), signalDim, new THREE.Vector3(1.1, 0.48, 0.2), new THREE.Vector3(1.1, 1.5, 0.2)),
    addPart('GPU', new THREE.BoxGeometry(2.9, 0.24, 0.95), signal, new THREE.Vector3(0, -0.15, 1.55), new THREE.Vector3(0, -1.3, 1.55)),
    addPart('SSD', new THREE.BoxGeometry(0.85, 0.05, 0.55), ink, new THREE.Vector3(-1.55, 0.08, -1.1), new THREE.Vector3(-1.55, -2.0, -1.1)),
    addPart('PSU', new THREE.BoxGeometry(1.3, 0.9, 1.3), ink, new THREE.Vector3(1.5, -0.5, -1.0), new THREE.Vector3(1.5, -2.8, -1.0)),
    addPart('Networking', new THREE.BoxGeometry(0.45, 0.12, 0.45), ember, new THREE.Vector3(1.7, 0.1, -1.4), new THREE.Vector3(1.7, 2.6, -1.4)),
  ];

  let exploded = false;
  const target = new Map<string, THREE.Vector3>();
  parts.forEach((p) => target.set(p.key, p.assembled.clone()));

  const canvasEl = canvas;
  const tmpVec = new THREE.Vector3();
  function computeLabels(labelOpacity: number): ScreenLabel[] {
    const rect = canvasEl.getBoundingClientRect();
    return parts.map((p) => {
      p.mesh.getWorldPosition(tmpVec);
      tmpVec.project(camera);
      return {
        key: p.key,
        x: (tmpVec.x * 0.5 + 0.5) * rect.width,
        y: (-tmpVec.y * 0.5 + 0.5) * rect.height,
        visible: tmpVec.z < 1,
        opacity: labelOpacity,
      };
    });
  }

  let labelOpacity = 0;
  const removeDrag = addDragRotate(canvas, (dx, dy) => {
    group.rotation.y += dx * 0.006;
    group.rotation.x = Math.max(-0.5, Math.min(0.5, group.rotation.x + dy * 0.006));
  });

  let frameId = 0;
  let running = false;
  const clock = new THREE.Clock();
  let autoRotate = true;

  function animate() {
    if (!running) return;
    frameId = requestAnimationFrame(animate);
    const dt = clock.getDelta();

    if (autoRotate) group.rotation.y += dt * 0.12;

    parts.forEach((p) => {
      const t = target.get(p.key)!;
      p.mesh.position.lerp(t, 0.08);
    });

    const opacityTarget = exploded ? 1 : 0;
    labelOpacity += (opacityTarget - labelOpacity) * 0.1;

    renderer.render(scene, camera);
    opts.onUpdate?.(computeLabels(labelOpacity));
  }

  canvas.addEventListener('pointerdown', () => {
    autoRotate = false;
  });

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
    setExploded(next: boolean) {
      exploded = next;
      parts.forEach((p) => target.set(p.key, (next ? p.exploded : p.assembled).clone()));
    },
    dispose() {
      running = false;
      cancelAnimationFrame(frameId);
      removeDrag();
      stopForTab();
      disposables.forEach(({ geo, mat }) => {
        geo.dispose();
        mat.dispose();
      });
      disposeBase();
    },
  };
}
