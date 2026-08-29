import type {
  ClosestRoutePoint,
  NavigationNode,
  NavigationPoint,
  RouteGeometry,
  RouteSegment,
} from "../types/navigation";
import {
  clamp,
  distance3D,
  headingBetween,
  interpolatePoint,
} from "../utils/navigationMath";

export function createRouteGeometry(nodes: NavigationNode[]): RouteGeometry {
  let routeDistance = 0;
  const segments: RouteSegment[] = [];

  for (let index = 0; index < nodes.length - 1; index += 1) {
    const from = nodes[index];
    const to = nodes[index + 1];
    const length = distance3D(from, to);

    segments.push({
      index,
      from,
      to,
      length,
      startDistance: routeDistance,
      endDistance: routeDistance + length,
      heading: headingBetween(from, to),
    });
    routeDistance += length;
  }

  return { nodes, segments, totalDistance: routeDistance };
}

function closestPointOnSegment(
  position: NavigationPoint,
  segment: RouteSegment,
): ClosestRoutePoint {
  const segmentX = segment.to.x - segment.from.x;
  const segmentY = segment.to.y - segment.from.y;
  const segmentZ = segment.to.z - segment.from.z;
  const squaredLength =
    segmentX * segmentX + segmentY * segmentY + segmentZ * segmentZ;
  const projection =
    squaredLength === 0
      ? 0
      : ((position.x - segment.from.x) * segmentX +
          (position.y - segment.from.y) * segmentY +
          (position.z - segment.from.z) * segmentZ) /
        squaredLength;
  const segmentProgress = clamp(projection, 0, 1);
  const point = interpolatePoint(segment.from, segment.to, segmentProgress);

  return {
    ...point,
    segmentIndex: segment.index,
    segmentProgress,
    routeDistance: segment.startDistance + segment.length * segmentProgress,
    distanceFromRoute: distance3D(position, point),
  };
}

export function findClosestRoutePoint(
  position: NavigationPoint,
  route: RouteGeometry,
  previousSegmentIndex?: number,
): ClosestRoutePoint {
  if (route.segments.length === 0) {
    throw new Error(
      "A route needs at least one segment for position tracking.",
    );
  }

  const candidates =
    previousSegmentIndex === undefined
      ? route.segments
      : route.segments.filter(
          (segment) =>
            segment.index >= Math.max(0, previousSegmentIndex - 1) &&
            segment.index <=
              Math.min(route.segments.length - 1, previousSegmentIndex + 3),
        );

  return candidates
    .map((segment) => closestPointOnSegment(position, segment))
    .reduce((closest, candidate) =>
      candidate.distanceFromRoute < closest.distanceFromRoute
        ? candidate
        : closest,
    );
}

export function pointAtRouteDistance(
  route: RouteGeometry,
  routeDistance: number,
) {
  const distance = clamp(routeDistance, 0, route.totalDistance);
  const segment =
    route.segments.find((item) => distance <= item.endDistance) ??
    route.segments.at(-1);

  if (!segment) {
    const node = route.nodes[0];
    return { point: node, heading: 0, segmentIndex: 0 };
  }

  const progress =
    segment.length === 0
      ? 1
      : (distance - segment.startDistance) / segment.length;

  return {
    point: interpolatePoint(segment.from, segment.to, progress),
    heading: segment.heading,
    segmentIndex: segment.index,
  };
}
