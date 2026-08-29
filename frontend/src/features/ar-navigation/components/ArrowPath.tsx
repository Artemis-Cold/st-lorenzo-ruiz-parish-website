import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

import { pointAtRouteDistance } from "../navigation/routeGeometry";
import type { NavigationSnapshot, RouteGeometry } from "../types/navigation";
import FloorArrow from "./FloorArrow";

interface ArrowPathProps {
  route: RouteGeometry;
  snapshot: NavigationSnapshot;
}

const ARROW_SPACING_METERS = 0.72;
const FIRST_ARROW_DISTANCE_METERS = 0.75;
const VISIBLE_ROUTE_DISTANCE_METERS = 13;
const FLOW_SPEED_METERS_PER_SECOND = 0.62;
const ARROW_COUNT =
  Math.ceil(VISIBLE_ROUTE_DISTANCE_METERS / ARROW_SPACING_METERS) + 1;

export default function ArrowPath({ route, snapshot }: ArrowPathProps) {
  const arrowRefs = useRef<Array<THREE.Group | null>>([]);
  const initialArrow = pointAtRouteDistance(
    route,
    Math.min(route.totalDistance, FIRST_ARROW_DISTANCE_METERS),
  );

  useFrame(({ clock }) => {
    const flowOffset =
      (clock.elapsedTime * FLOW_SPEED_METERS_PER_SECOND) % ARROW_SPACING_METERS;
    const routeStart =
      snapshot.closestPoint.routeDistance +
      FIRST_ARROW_DISTANCE_METERS +
      flowOffset;
    const routeEnd = Math.min(
      route.totalDistance,
      snapshot.closestPoint.routeDistance + VISIBLE_ROUTE_DISTANCE_METERS,
    );

    arrowRefs.current.forEach((arrow, index) => {
      if (!arrow) return;

      const distance = routeStart + index * ARROW_SPACING_METERS;
      if (distance > routeEnd || distance > route.totalDistance) {
        arrow.visible = false;
        return;
      }

      const routePoint = pointAtRouteDistance(route, distance);
      const pulse =
        0.94 + Math.sin(clock.elapsedTime * 4.2 - index * 0.55) * 0.06;
      arrow.visible = true;
      arrow.position.set(
        routePoint.point.x,
        routePoint.point.y + 0.025,
        routePoint.point.z,
      );
      arrow.rotation.set(0, (routePoint.heading * Math.PI) / 180, 0);
      arrow.scale.setScalar(pulse);
    });
  });

  return Array.from({ length: ARROW_COUNT }, (_, index) => (
    <FloorArrow
      key={index}
      ref={(arrow) => {
        arrowRefs.current[index] = arrow;
      }}
      position={initialArrow.point}
      heading={initialArrow.heading}
      opacity={Math.max(0.42, 0.97 - index * 0.03)}
    />
  ));
}
