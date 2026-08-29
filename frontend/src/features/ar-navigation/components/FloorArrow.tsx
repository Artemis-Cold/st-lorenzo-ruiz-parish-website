import { forwardRef } from "react";
import * as THREE from "three";

import type { NavigationPoint } from "../types/navigation";

interface FloorArrowProps {
  position: NavigationPoint;
  heading: number;
  opacity?: number;
}

const arrowShape = new THREE.Shape();
arrowShape.moveTo(-0.13, -0.34);
arrowShape.lineTo(0.13, -0.34);
arrowShape.lineTo(0.13, 0.02);
arrowShape.lineTo(0.29, 0.02);
arrowShape.lineTo(0, 0.38);
arrowShape.lineTo(-0.29, 0.02);
arrowShape.lineTo(-0.13, 0.02);
arrowShape.closePath();

const FloorArrow = forwardRef<THREE.Group, FloorArrowProps>(function FloorArrow(
  { position, heading, opacity = 0.92 }: FloorArrowProps,
  ref,
) {
  return (
    <group
      ref={ref}
      position={[position.x, position.y + 0.025, position.z]}
      rotation={[0, (heading * Math.PI) / 180, 0]}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={2}>
        <shapeGeometry args={[arrowShape]} />
        <meshBasicMaterial
          color="#22f4ee"
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -0.003, 0]}
        scale={1.12}
        renderOrder={1}
      >
        <shapeGeometry args={[arrowShape]} />
        <meshBasicMaterial
          color="#0891b2"
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
});

export default FloorArrow;
