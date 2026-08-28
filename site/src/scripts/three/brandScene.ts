import * as THREE from 'three';
import { createBaseScene, readColorToken, addDragRotate, onTabHidden } from './utils';

export interface ScreenPosition {
  x: number;
  y: number;
  visible: boolean;
}

export interface BrandSceneOptions {
  steps: string[];
  onUpdate?: (positions: ScreenPosition[]) => void;
}

export interface SceneHandle {
  start: () => void;
  stop: () => void;
  dispose: () => void;
}

/** Level 1 showcase for Branding: each flow step (Idea -> Sketch ->
 *  Geometry -> Typography -> Color -> Logo -> Brand System) becomes a
 *  low-poly faceted node climbing an ascending helix, with color
 *  interpolating from neutral ink through signal to the ember accent as
 *  it climbs — literalizing "a brand identity is built in layers"
 *  without depicting an actual, unapproved logo mark. Drag to rotate. */
export function createBrandScene(canvas: HTMLCanvasElement, opts: BrandSceneOptions): SceneHandle {
  const { renderer, scene, camera, dispose: disposeBase } = createBaseScene(canvas);
  camera.position.set(0, 0.4, 8);
  camera.lookAt(0, 0.2, 0);

  const inkColor = readColorToken('--bb-ink-400');
  const signalColor = readColorToken('--bb-signal-400');
  const emberColor = readColorToken('--bb-ember-500');

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(4, 5, 5);
  scene.add(light);

  const group = new THREE.Group();
  scene.add(group);

  const n = Math.max(opts.steps.length, 2);
  const nodeGeo = new THREE.IcosahedronGeometry(0.34, 0);
  const disposableMats: THREE.Material[] = [];

  interface Node {
    mesh: THREE.Mesh;
    spin: number;
  }
  const nodes: Node[] = [];
  const curvePoints: THREE.Vector3[] = [];

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const angle = i * 0.9;
    const radius = 1.9;
    const y = (i - (n - 1) / 2) * 0.85;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    curvePoints.push(new THREE.Vector3(x, y, z));

    const color = t < 0.5
      ? inkColor.clone().lerp(signalColor, t * 2)
      : signalColor.clone().lerp(emberColor, (t - 0.5) * 2);
    const mat = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.4, metalness: 0.25 });
    disposableMats.push(mat);

    const mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.position.set(x, y, z);
    const nodeScale = 0.75 + t * 0.55;
    mesh.scale.setScalar(nodeScale);
    group.add(mesh);
    nodes.push({ mesh, spin: 0.3 + Math.random() * 0.4 });
  }

  const curve = new THREE.CatmullRomCurve3(curvePoints);
  const tubeGeo = new THREE.TubeGeometry(curve, 96, 0.012, 6, false);
  const tubeMat = new THREE.MeshBasicMaterial({ color: signalColor, transparent: true, opacity: 0.3 });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  group.add(tube);

  group.rotation.x = -0.15;

  const removeDrag = addDragRotate(canvas, (dx, dy) => {
    group.rotation.y += dx * 0.006;
    group.rotation.x = Math.max(-0.6, Math.min(0.4, group.rotation.x + dy * 0.006));
  });

  const canvasEl = canvas;
  const tmpVec = new THREE.Vector3();
  function computeScreenPositions(): ScreenPosition[] {
    const rect = canvasEl.getBoundingClientRect();
    return nodes.map(({ mesh }) => {
      mesh.getWorldPosition(tmpVec);
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
  let autoRotate = true;
  const clock = new THREE.Clock();

  canvas.addEventListener('pointerdown', () => {
    autoRotate = false;
  });

  function animate() {
    if (!running) return;
    frameId = requestAnimationFrame(animate);
    const dt = clock.getDelta();

    if (autoRotate) group.rotation.y += dt * 0.15;
    nodes.forEach((node) => {
      node.mesh.rotation.x += dt * node.spin;
      node.mesh.rotation.y += dt * node.spin * 0.7;
    });

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
      removeDrag();
      stopForTab();
      nodeGeo.dispose();
      disposableMats.forEach((m) => m.dispose());
      tubeGeo.dispose();
      tubeMat.dispose();
      disposeBase();
    },
  };
}
