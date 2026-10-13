import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Group,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  CurvePath,
  LineCurve3,
  TubeGeometry,
  Vector3,
} from "three";
import { worldRoute } from "./qrNavigation";

export type XRGuideState =
  "finding-floor" | "ready" | "aligned" | "tracking-lost";

/** Owns the XR session. No MindAR or getUserMedia camera runs alongside it. */
export async function createXRRoute(
  session: XRSession,
  host: HTMLElement,
  points: { x: number; y: number }[],
  facing: number,
  onState: (state: XRGuideState) => void,
  onEnd: () => void,
) {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType("local-floor");
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  const scene = new Scene(),
    camera = new PerspectiveCamera();
  const route = new Group();
  scene.add(route);
  const material = new MeshBasicMaterial({ color: 0xf5d76e });
  const reticle = new Mesh(new RingGeometry(0.12, 0.15, 32), material);
  reticle.rotation.x = -Math.PI / 2;
  reticle.visible = false;
  scene.add(reticle);
  let line: Mesh<TubeGeometry, MeshBasicMaterial> | null = null;
  let source: XRHitTestSource | undefined;
  let reference: XRReferenceSpace | null = null;
  let ended = false,
    aligned = false;
  let state: XRGuideState | null = null;
  let alignment: {
    origin: { x: number; y: number; z: number };
    forward: { x: number; z: number };
  } | null = null;
  const emit = (next: XRGuideState) => {
    if (state !== next && !ended) {
      state = next;
      onState(next);
    }
  };
  const invalidate = () => {
    aligned = false;
    alignment = null;
    route.visible = false;
    reticle.visible = false;
    emit("tracking-lost");
  };
  const visibility = () => {
    if (session.visibilityState !== "visible") invalidate();
  };
  const dispose = () => {
    if (ended) return;
    ended = true;
    renderer.setAnimationLoop(null);
    source?.cancel();
    reference?.removeEventListener("reset", invalidate);
    session.removeEventListener("visibilitychange", visibility);
    session.removeEventListener("end", dispose);
    line?.geometry.dispose();
    reticle.geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    onEnd();
  };
  session.addEventListener("end", dispose);
  session.addEventListener("visibilitychange", visibility);
  try {
    await renderer.xr.setSession(session);
    if (ended) throw new Error("AR session ended.");
    reference = renderer.xr.getReferenceSpace();
    if (!reference) throw new Error("Floor tracking is unavailable.");
    reference.addEventListener("reset", invalidate);
    const viewer = await session.requestReferenceSpace("viewer");
    if (ended) throw new Error("AR session ended.");
    source = await session.requestHitTestSource?.({ space: viewer });
    if (ended) {
      source?.cancel();
      throw new Error("AR session ended.");
    }
    if (!source)
      throw new Error("Floor detection is unavailable on this device.");
    renderer.setAnimationLoop((_time, frame) => {
      if (ended || !frame || !reference || !source) return;
      const pose = frame.getViewerPose(reference);
      if (
        !pose ||
        pose.emulatedPosition ||
        session.visibilityState !== "visible"
      ) {
        invalidate();
        renderer.render(scene, camera);
        return;
      }
      if (!aligned) {
        const matrix = pose.transform.matrix;
        const forward = { x: -matrix[8], z: -matrix[10] };
        const hit = frame
          .getHitTestResults(source)
          .map((result) => result.getPose(reference!))
          .find(
            (result) =>
              result &&
              result.transform.matrix[5] > 0.9 &&
              result.transform.position.y < pose.transform.position.y - 0.5 &&
              Math.hypot(
                result.transform.position.x - pose.transform.position.x,
                result.transform.position.z - pose.transform.position.z,
              ) < 3,
          );
        alignment =
          hit && Math.hypot(forward.x, forward.z) > 0.2
            ? {
                origin: {
                  x: pose.transform.position.x,
                  y: hit.transform.position.y,
                  z: pose.transform.position.z,
                },
                forward,
              }
            : null;
        reticle.visible = !!alignment;
        if (hit)
          reticle.position.set(
            hit.transform.position.x,
            hit.transform.position.y + 0.01,
            hit.transform.position.z,
          );
        emit(alignment ? "ready" : "finding-floor");
      }
      renderer.render(scene, camera);
    });
    return {
      align() {
        if (!alignment || ended) return;
        const vertices = worldRoute(
          points,
          facing,
          alignment.origin,
          alignment.forward,
        );
        if (vertices.length < 2) return;
        const path = new CurvePath<Vector3>();
        for (let i = 1; i < vertices.length; i++) {
          const a = vertices[i - 1],
            b = vertices[i];
          if (Math.hypot(a.x - b.x, a.z - b.z) > 0.01)
            path.add(
              new LineCurve3(
                new Vector3(a.x, a.y, a.z),
                new Vector3(b.x, b.y, b.z),
              ),
            );
        }
        if (!path.curves.length) return;
        if (line) {
          route.remove(line);
          line.geometry.dispose();
        }
        line = new Mesh(
          new TubeGeometry(
            path,
            Math.max(32, Math.ceil(path.getLength() * 12)),
            0.045,
            6,
            false,
          ),
          material,
        );
        route.add(line);
        route.visible = true;
        reticle.visible = false;
        aligned = true;
        emit("aligned");
      },
      reset: invalidate,
      async stop() {
        if (!ended) {
          try {
            await session.end();
          } catch {
            /* May already be ending. */
          } finally {
            dispose();
          }
        }
      },
    };
  } catch (error) {
    if (!ended) {
      try {
        await session.end();
      } catch {
        /* Already ended. */
      }
    }
    dispose();
    throw error;
  }
}
