import { useMemo } from "react";

import { pointAtRouteDistance } from "../navigation/routeGeometry";
import type {
  NavigationPoint,
  NavigationSnapshot,
  RouteGeometry,
} from "../types/navigation";
import { clamp, distance3D } from "../utils/navigationMath";

interface RouteLineOverlayProps {
  route: RouteGeometry;
  snapshot: NavigationSnapshot;
}

interface ScreenPoint {
  x: number;
  y: number;
}

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 100;
const SAMPLE_INTERVAL_METERS = 0.45;
const MAX_VISIBLE_ROUTE_METERS = 12;

function projectPoint(
  point: NavigationPoint,
  pose: NavigationSnapshot["pose"],
): ScreenPoint {
  const deltaX = point.x - pose.x;
  const deltaZ = point.z - pose.z;
  const headingRadians = (pose.heading * Math.PI) / 180;
  const forward =
    deltaX * Math.sin(headingRadians) - deltaZ * Math.cos(headingRadians);
  const right =
    deltaX * Math.cos(headingRadians) + deltaZ * Math.sin(headingRadians);
  const perspectiveDepth = Math.max(0.8, forward + 1.2);

  return {
    x: clamp(50 + (right / perspectiveDepth) * 24, 4, 96),
    y: clamp(89 - Math.max(-0.2, forward) * 7, 18, 91),
  };
}

function createVisibleRoutePoints(
  route: RouteGeometry,
  snapshot: NavigationSnapshot,
): NavigationPoint[] {
  const startDistance = snapshot.closestPoint.routeDistance;
  const endDistance = Math.min(
    route.totalDistance,
    startDistance + MAX_VISIBLE_ROUTE_METERS,
  );
  const points: NavigationPoint[] = [snapshot.pose, snapshot.closestPoint];

  for (
    let distance = startDistance + SAMPLE_INTERVAL_METERS;
    distance < endDistance;
    distance += SAMPLE_INTERVAL_METERS
  ) {
    points.push(pointAtRouteDistance(route, distance).point);
  }

  points.push(pointAtRouteDistance(route, endDistance).point);

  return points.filter(
    (point, index) =>
      index === 0 || distance3D(points[index - 1], point) >= 0.04,
  );
}

export default function RouteLineOverlay({
  route,
  snapshot,
}: RouteLineOverlayProps) {
  const screenPoints = useMemo(
    () =>
      createVisibleRoutePoints(route, snapshot).map((point) =>
        projectPoint(point, snapshot.pose),
      ),
    [route, snapshot],
  );
  const polyline = screenPoints.map(({ x, y }) => `${x},${y}`).join(" ");
  const endpoint = screenPoints.at(-1) ?? { x: 50, y: 25 };

  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="none"
        className="size-full"
      >
        <defs>
          <linearGradient
            id="camera-route-gradient"
            x1="0"
            y1="1"
            x2="0"
            y2="0"
          >
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="72%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <filter
            id="camera-route-glow"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur stdDeviation="0.65" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <polyline
          points={polyline}
          fill="none"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="3.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={polyline}
          fill="none"
          stroke="url(#camera-route-gradient)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1.6 1"
          vectorEffect="non-scaling-stroke"
          filter="url(#camera-route-glow)"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="2.6"
            to="0"
            dur="0.85s"
            repeatCount="indefinite"
          />
        </polyline>

        <circle
          cx="50"
          cy="89"
          r="1.9"
          fill="#ffffff"
          stroke="#06b6d4"
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={endpoint.x}
          cy={endpoint.y}
          r="1.8"
          fill={snapshot.arrived ? "#34d399" : "#fbbf24"}
          stroke="#ffffff"
          strokeWidth="0.7"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
