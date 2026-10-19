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
import {
  selectFloor,
  usableFloor,
  missingPoseState,
  type FloorSample,
} from "./floorDetection";

export type XRGuideState =
  | "initializing"
  | "finding-floor"
  | "ready"
  | "aligned"
  | "tracking-paused"
  | "tracking-lost";

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
  let downwardSource: XRHitTestSource | undefined;
  let floorSample: FloorSample | null = null;
  let lastCamera = { x: 0, y: 0, z: 0 };
  let reference: XRReferenceSpace | null = null;
  let ended = false,
    aligned = false;
  let state: XRGuideState | null = null;
  let missingSince: number | null = null;
  let needsRealign = false;
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
    needsRealign ||= aligned;
    aligned = false;
    alignment = null;
    floorSample = null;
    route.visible = false;
    reticle.visible = false;
    emit(needsRealign ? "tracking-lost" : "finding-floor");
  };
  const visibility = () => {
    if (session.visibilityState !== "visible") invalidate();
  };
  const dispose = () => {
    if (ended) return;
    ended = true;
    renderer.setAnimationLoop(null);
    source?.cancel();
    downwardSource?.cancel();
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
    // A second ray samples below screen centre, so floor discovery does not
    // depend on aiming one exact pixel. Optional: the centre ray still works
    // on browsers that reject an additional source.
    if (typeof XRRay !== "undefined") {
      void session
        .requestHitTestSource?.({
          space: viewer,
          offsetRay: new XRRay(
            { x: 0, y: 0, z: 0, w: 1 },
            { x: 0, y: -0.5, z: -Math.sqrt(0.75), w: 0 },
          ),
        })
        ?.then((extra) => {
          if (ended) extra.cancel();
          else downwardSource = extra;
        })
        .catch(() => {
          /* Centre-ray detection remains available. */
        });
    }
    renderer.setAnimationLoop((_time, frame) => {
      if (ended || !frame || !reference || !source) return;
      const pose = frame.getViewerPose(reference);
      if (
        !pose ||
        pose.emulatedPosition ||
        session.visibilityState !== "visible"
      ) {
        missingSince ??= performance.now();
        route.visible = false;
        reticle.visible = false;
        alignment = null;
        floorSample = null;
        const next = missingPoseState(
          aligned,
          performance.now() - missingSince,
        );
        if (next === "tracking-lost") invalidate();
        else emit(needsRealign ? "tracking-lost" : next);
        renderer.render(scene, camera);
        return;
      }
      missingSince = null;
      if (needsRealign) {
        renderer.render(scene, camera);
        return;
      }
      if (aligned) {
        route.visible = true;
        emit("aligned");
      }
      if (!aligned) {
        lastCamera = {
          x: pose.transform.position.x,
          y: pose.transform.position.y,
          z: pose.transform.position.z,
        };
        const matrix = pose.transform.matrix;
        const forward = { x: -matrix[8], z: -matrix[10] };
        const hits = [source, downwardSource]
          .flatMap((s) => (s ? frame.getHitTestResults(s) : []))
          .flatMap((result) => {
            const hit = result.getPose(reference!);
            return hit
              ? [
                  {
                    point: {
                      x: hit.transform.position.x,
                      y: hit.transform.position.y,
                      z: hit.transform.position.z,
                    },
                    normalY: hit.transform.matrix[5],
                  },
                ]
              : [];
          });
        const hit = selectFloor(hits, lastCamera);
        if (hit)
          floorSample = {
            point: hit,
            camera: lastCamera,
            time: performance.now(),
          };
        if (!usableFloor(floorSample, lastCamera, performance.now()))
          floorSample = null;
        alignment =
          floorSample && Math.hypot(forward.x, forward.z) > 0.2
            ? {
                origin: {
                  x: pose.transform.position.x,
                  y: floorSample.point.y,
                  z: pose.transform.position.z,
                },
                forward,
              }
            : null;
        reticle.visible = !!alignment;
        if (floorSample)
          reticle.position.set(
            floorSample.point.x,
            floorSample.point.y + 0.01,
            floorSample.point.z,
          );
        emit(alignment ? "ready" : "finding-floor");
      }
      renderer.render(scene, camera);
    });
    return {
      align() {
        if (
          !alignment ||
          ended ||
          !usableFloor(floorSample, lastCamera, performance.now())
        )
          return;
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
      reset() {
        invalidate();
        needsRealign = false;
        missingSince = null;
        emit("finding-floor");
      },
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
