import type {
  NavigationSnapshot,
  RouteGeometry,
  TurnDirection,
  UserPose,
} from "../types/navigation";
import {
  normalizeHeading,
  signedHeadingDifference,
} from "../utils/navigationMath";
import { findClosestRoutePoint } from "./routeGeometry";

const TURN_THRESHOLD_DEGREES = 20;
const OFF_ROUTE_THRESHOLD_METERS = 1.5;
const ARRIVAL_THRESHOLD_METERS = 0.25;

function nextTurn(
  route: RouteGeometry,
  currentSegmentIndex: number,
  currentRouteDistance: number,
): { distance: number; direction: TurnDirection } {
  for (
    let index = currentSegmentIndex;
    index < route.segments.length - 1;
    index += 1
  ) {
    const segment = route.segments[index];
    const following = route.segments[index + 1];
    const difference = signedHeadingDifference(
      segment.heading,
      following.heading,
    );

    if (Math.abs(difference) >= TURN_THRESHOLD_DEGREES) {
      return {
        distance: Math.max(0, segment.endDistance - currentRouteDistance),
        direction: difference > 0 ? "right" : "left",
      };
    }
  }

  return {
    distance: Math.max(0, route.totalDistance - currentRouteDistance),
    direction: "arrive",
  };
}

export function trackRoute(
  pose: UserPose,
  route: RouteGeometry,
  previousSegmentIndex?: number,
): NavigationSnapshot {
  const closestPoint = findClosestRoutePoint(pose, route, previousSegmentIndex);
  const currentSegment = route.segments[closestPoint.segmentIndex];
  const nextSegment = route.segments[closestPoint.segmentIndex + 1] ?? null;
  const distanceRemaining = Math.max(
    0,
    route.totalDistance - closestPoint.routeDistance,
  );
  const turn = nextTurn(
    route,
    closestPoint.segmentIndex,
    closestPoint.routeDistance,
  );

  return {
    pose: { ...pose, heading: normalizeHeading(pose.heading) },
    closestPoint,
    currentSegment,
    nextSegment,
    desiredHeading: currentSegment.heading,
    headingDifference: signedHeadingDifference(
      pose.heading,
      currentSegment.heading,
    ),
    distanceToNextTurn: turn.distance,
    distanceRemaining,
    progress:
      route.totalDistance === 0
        ? 1
        : closestPoint.routeDistance / route.totalDistance,
    turnDirection: turn.direction,
    offRoute: closestPoint.distanceFromRoute > OFF_ROUTE_THRESHOLD_METERS,
    arrived:
      distanceRemaining <= ARRIVAL_THRESHOLD_METERS &&
      closestPoint.distanceFromRoute <= OFF_ROUTE_THRESHOLD_METERS,
  };
}
