import * as THREE from 'three';
import { createBaseScene, readColorToken, getQualityTier, qualityScale, onTabHidden } from './utils';

export interface ScreenPosition {
  x: number;
  y: number;
  visible: boolean;
}

export interface NodeGraphOptions {
  steps: string[];
  /** DevOps-style traveling pulse along the pipeline, vs. Cloud's calm
   *  orbit — same geometry, different motion, so the two Level 1
   *  service pages that share this component still read distinctly. */
  pulse?: boolean;
  accentVar?: string;
  onUpdate?: (positions: ScreenPosition[]) => void;
}

export interface SceneHandle {
  start: () => void;
  stop: () => void;
  dispose: () => void;
}

/** Renders a service's flow steps as connected 3D nodes along a gentle
 *  curve — the same data driving the static FlowSteps diagram below it
 *  on the page, just visualized in 3D as the Level 1 showcase. */
export function createNodeGraphScene(canvas: HTMLCanvasElement, opts: NodeGraphOptions): SceneHandle {
  const { renderer, scene, camera, dispose: disposeBase } = createBaseScene(canvas);
  camera.position.set(0, 0.5, 7.2);

  const accent = readColorToken(opts.accentVar ?? '--bb-signal-400');
  const pulseColor = readColorToken('--bb-ember-400');
  const tubeSegments = Math.round(64 * qualityScale(getQualityTier()));
  const n = Math.max(opts.steps.length, 2);
  const spacing = 2.0;

  const points: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * spacing;
    const y = Math.sin(i * 0.85) * 0.85;
    const z = Math.cos(i * 0.6) * 0.75;
    points.push(new THREE.Vector3(x, y, z));
  }

  const group = new THREE.Group();
  scene.add(group);

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeo = new THREE.TubeGeometry(curve, Math.max(tubeSegments, n * 12), 0.028, 8, false);
  const tubeMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.35 });
  group.add(new THREE.Mesh(tubeGeo, tubeMat));

  const nodeGeo = new THREE.SphereGeometry(0.15, 24, 24);
  const nodeMat = new THREE.MeshBasicMaterial({ color: accent });
  const nodeMeshes = points.map((p) => {
    const mesh = new THREE.Mesh(nodeGeo, nodeMat);
    mesh.position.copy(p);
    group.add(mesh);
    return mesh;
  });

  let pulseMesh: THREE.Mesh | null = null;
  let pulseGeo: THREE.SphereGeometry | null = null;
  let pulseMat: THREE.MeshBasicMaterial | null = null;
  if (opts.pulse) {
    pulseGeo = new THREE.SphereGeometry(0.085, 16, 16);
    pulseMat = new THREE.MeshBasicMaterial({ color: pulseColor });
    pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    group.add(pulseMesh);
  }

  const canvasEl = canvas;
  const tmpVec = new THREE.Vector3();
  function computeScreenPositions(): ScreenPosition[] {
    const rect = canvasEl.getBoundingClientRect();
    return nodeMeshes.map((mesh) => {
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
  const clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    group.rotation.y = Math.sin(t * 0.15) * 0.2;
    if (pulseMesh) {
      const loopT = (t * 0.12) % 1;
      pulseMesh.position.copy(curve.getPointAt(loopT));
    }
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
      tubeGeo.dispose();
      tubeMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      pulseGeo?.dispose();
      pulseMat?.dispose();
      disposeBase();
    },
  };
}
