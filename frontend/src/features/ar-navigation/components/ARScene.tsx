import { PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

import type { NavigationSnapshot, RouteGeometry } from "../types/navigation";
import ArrowPath from "./ArrowPath";

interface ARSceneProps {
  route: RouteGeometry;
  snapshot: NavigationSnapshot;
}

function CameraRig({ snapshot }: { snapshot: NavigationSnapshot }) {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useFrame(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    const { pose } = snapshot;
    camera.position.set(pose.x, pose.y + 1.55, pose.z);
    camera.rotation.order = "YXZ";
    camera.rotation.set(
      ((pose.pitch ?? -18) * Math.PI) / 180,
      Math.PI + (pose.heading * Math.PI) / 180,
      ((pose.roll ?? 0) * Math.PI) / 180,
    );
    camera.updateMatrixWorld();
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={66}
      near={0.05}
      far={60}
    />
  );
}

export default function ARScene({ route, snapshot }: ARSceneProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <Canvas
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <CameraRig snapshot={snapshot} />
        <ArrowPath route={route} snapshot={snapshot} />
      </Canvas>
    </div>
  );
}
