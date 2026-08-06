import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

/**
 * ARTest — Phase 1 proof of concept.
 *
 * Goal: confirm WebXR AR sessions work on your target device (Android Chrome),
 * and that a 3D object stays anchored in the real world as you walk around
 * with the phone. No beacons, no backend, no pathfinding yet — just the
 * camera + AR session + one floating arrow.
 *
 * Route this at something like /ar-test in your existing React app's router.
 */
export default function ARTest(): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Basic three.js scene setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // WebXR requires an explicit "Enter AR" button — this creates it and
    // appends it to the page. It also requests the "hit-test" feature,
    // which lets us place objects on detected real-world surfaces.
    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
    });
    document.body.appendChild(arButton);

    // --- Lighting so the arrow isn't a flat silhouette ---
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(0, 1, 0);
    scene.add(directional);

    // --- A simple arrow: cone (head) + cylinder (shaft) ---
    const arrow = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.15, 12),
      new THREE.MeshStandardMaterial({ color: 0x1d9e75 }),
    );
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = -0.075;
    const head = new THREE.Mesh(
      new THREE.ConeGeometry(0.03, 0.06, 12),
      new THREE.MeshStandardMaterial({ color: 0x1d9e75 }),
    );
    head.rotation.x = Math.PI / 2;
    head.position.z = -0.18;
    arrow.add(shaft, head);
    arrow.visible = false; // hidden until we place it on a surface
    scene.add(arrow);

    // --- Hit-testing: find real-world surfaces to place the arrow on ---
    let hitTestSource: XRHitTestSource | undefined;
    let hitTestSourceRequested = false;

    const reticleGeometry = new THREE.RingGeometry(0.03, 0.04, 32).rotateX(
      -Math.PI / 2,
    );
    const reticle = new THREE.Mesh(
      reticleGeometry,
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    reticle.visible = false;
    reticle.matrixAutoUpdate = false;
    scene.add(reticle);

    // Tap the screen once a reticle is visible to place the arrow there.
    const controller = renderer.xr.getController(0);
    controller.addEventListener("select", () => {
      if (reticle.visible) {
        arrow.position.setFromMatrixPosition(reticle.matrix);
        arrow.visible = true;
      }
    });
    scene.add(controller);

    renderer.setAnimationLoop((_timestamp: number, frame?: XRFrame) => {
      if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (!hitTestSourceRequested && session && referenceSpace) {
          session.requestReferenceSpace("viewer").then((viewerSpace) => {
            session
              .requestHitTestSource?.({ space: viewerSpace })
              ?.then((source) => {
                hitTestSource = source;
              });
          });
          session.addEventListener("end", () => {
            hitTestSourceRequested = false;
            hitTestSource = undefined;
          });
          hitTestSourceRequested = true;
        }

        if (hitTestSource && referenceSpace) {
          const hits = frame.getHitTestResults(hitTestSource);
          if (hits.length > 0) {
            const pose = hits[0].getPose(referenceSpace);
            if (pose) {
              reticle.visible = true;
              reticle.matrix.fromArray(pose.transform.matrix);
            }
          } else {
            reticle.visible = false;
          }
        }
      }
      renderer.render(scene, camera);
    });

    // --- Cleanup on unmount ---
    return () => {
      renderer.setAnimationLoop(null);
      container.removeChild(renderer.domElement);
      arButton.remove();
    };
  }, []);

  return (
    <div>
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      />
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          padding: "12px 16px",
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          borderRadius: 8,
          fontSize: 14,
          zIndex: 10,
        }}
      >
        Tap "Enter AR" below, point your phone at the floor, then tap the screen
        once you see a white ring — that places the arrow.
      </div>
    </div>
  );
}
