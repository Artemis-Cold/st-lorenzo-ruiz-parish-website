import {
  AmbientLight,
  DirectionalLight,
  ExtrudeGeometry,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  Shape,
  WebGLRenderer,
} from "three";
import type { NavigationDirection } from "../types/checkpointNavigation";

// Screen-space shapes: no camera pose, physical floor or compass dependency.
const straight = [
  [-0.18, -0.85],
  [0.18, -0.85],
  [0.18, 0.25],
  [0.58, 0.25],
  [0, 0.9],
  [-0.58, 0.25],
  [-0.18, 0.25],
];
const right = [
  [-0.65, -0.85],
  [-0.25, -0.85],
  [-0.25, 0.12],
  [0.25, 0.12],
  [0.25, -0.25],
  [0.95, 0.32],
  [0.25, 0.9],
  [0.25, 0.52],
  [-0.65, 0.52],
];
const back = [
  [0.65, -0.65],
  [0.3, -0.65],
  [0.3, 0.4],
  [-0.3, 0.4],
  [-0.3, -0.05],
  [0.02, -0.05],
  [-0.48, -0.75],
  [-0.98, -0.05],
  [-0.65, -0.05],
  [-0.65, 0.75],
  [0.65, 0.75],
];
const check = [
  [-0.85, -0.05],
  [-0.6, 0.2],
  [-0.2, -0.2],
  [0.65, 0.75],
  [0.92, 0.5],
  [-0.2, -0.72],
];

export function createNavigationArrow(host: HTMLDivElement) {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
  host.appendChild(renderer.domElement);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1.5, 1.5, 1.2, -1.2, 0.1, 20);
  camera.position.z = 5;
  scene.add(new AmbientLight(0xffffff, 1.4));
  const light = new DirectionalLight(0xffffff, 2);
  light.position.set(-2, 3, 5);
  scene.add(light);
  const material = new MeshStandardMaterial({
    color: 0xf5d76e,
    roughness: 0.35,
    metalness: 0.15,
  });
  const edgeMaterial = new MeshStandardMaterial({
    color: 0x946719,
    roughness: 0.45,
    metalness: 0.2,
  });
  const shapes = {
    straight,
    right,
    left: right.map(([x, y]) => [-x, y]),
    back,
    destination: check,
  };
  const geometries = Object.fromEntries(
    Object.entries(shapes).map(([key, points]) => {
      const shape = new Shape();
      points.forEach(([x, y], index) =>
        index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y),
      );
      shape.closePath();
      return [
        key,
        new ExtrudeGeometry(shape, {
          depth: 0.22,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 1,
          bevelSize: 0.035,
          bevelThickness: 0.035,
        }),
      ];
    }),
  );
  const mesh = new Mesh(geometries.straight, [material, edgeMaterial]);
  mesh.rotation.set(-0.36, 0, 0);
  scene.add(mesh);
  let disposed = false;
  let contextLost = false;
  let direction: NavigationDirection = "unknown";
  const render = () => {
    if (disposed || contextLost) return;
    try {
      renderer.render(scene, camera);
      renderer.domElement.style.visibility = "visible";
      host.dataset.renderer = direction === "unknown" ? "fallback" : "ready";
    } catch {
      host.dataset.renderer = "fallback";
      renderer.domElement.style.visibility = "hidden";
    }
  };
  const resize = () => {
    if (disposed) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    const halfHeight = Math.max(1.2, (1.2 * height) / width);
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.left = (-halfHeight * width) / height;
    camera.right = (halfHeight * width) / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  };
  const lost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    host.dataset.renderer = "fallback";
    renderer.domElement.style.visibility = "hidden";
  };
  const restored = () => {
    contextLost = false;
    renderer.domElement.style.visibility = "visible";
    resize();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  renderer.domElement.addEventListener("webglcontextrestored", restored);
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  return {
    setDirection(next: NavigationDirection) {
      if (disposed) return;
      direction = next;
      mesh.visible = next !== "unknown";
      if (next !== "unknown") mesh.geometry = geometries[next];
      material.color.set(next === "destination" ? 0x34d399 : 0xf5d76e);
      edgeMaterial.color.set(next === "destination" ? 0x12664f : 0x946719);
      render();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      renderer.domElement.removeEventListener("webglcontextrestored", restored);
      Object.values(geometries).forEach((geometry) => geometry.dispose());
      material.dispose();
      edgeMaterial.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      host.dataset.renderer = "fallback";
    },
  };
}
