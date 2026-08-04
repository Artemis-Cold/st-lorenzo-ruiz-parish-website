import type { Waypoint, Edge, RouteStep } from "../types";

/**
 * Finds the shortest path (fewest hops) between two waypoint ids
 * using breadth-first search, then converts it into a list of
 * RouteSteps the UI/AR layer can walk through one scan at a time.
 */
export function findRoute(
  startId: string,
  destinationId: string,
  waypoints: Waypoint[],
  edges: Edge[]
): RouteStep[] {
  if (startId === destinationId) return [];

  const waypointById = new Map(waypoints.map((w) => [w.id, w]));
  const adjacency = new Map<string, Edge[]>();
  for (const edge of edges) {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from)!.push(edge);
  }

  const visited = new Set<string>([startId]);
  const queue: string[][] = [[startId]]; // each item is a path of ids

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (current === destinationId) {
      return pathToSteps(path, waypointById, edges);
    }

    const neighbors = adjacency.get(current) ?? [];
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        queue.push([...path, edge.to]);
      }
    }
  }

  // No path found
  return [];
}

function pathToSteps(
  idPath: string[],
  waypointById: Map<string, Waypoint>,
  edges: Edge[]
): RouteStep[] {
  const steps: RouteStep[] = [];

  for (let i = 0; i < idPath.length - 1; i++) {
    const fromId = idPath[i];
    const toId = idPath[i + 1];
    const edge = edges.find((e) => e.from === fromId && e.to === toId);
    if (!edge) continue;

    steps.push({
      from: waypointById.get(fromId)!,
      to: waypointById.get(toId)!,
      bearing: edge.bearing,
      instruction: edge.instruction,
      distanceMeters: edge.distanceMeters,
    });
  }

  return steps;
}
