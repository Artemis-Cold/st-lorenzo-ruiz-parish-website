import type {
  CalculatedRoute,
  NavigationGraph,
} from "../types/checkpointNavigation.ts";

/** Dijkstra routing over explicit passages only; null means unreachable. */
export function calculateRoute(
  startId: string,
  destinationId: string,
  graph: NavigationGraph,
): CalculatedRoute | null {
  const adjacency = new Map<string, { to: string; distance: number }[]>();
  for (const node of graph.nodes) {
    if (!node.id || adjacency.has(node.id)) {
      throw new Error(`Empty or duplicate node ID: "${node.id}".`);
    }
    adjacency.set(node.id, []);
  }
  for (const edge of graph.edges) {
    const from = adjacency.get(edge.from);
    const to = adjacency.get(edge.to);
    if (!from || !to) {
      throw new Error(`Unknown node in passage: ${edge.from} → ${edge.to}.`);
    }
    if (!Number.isFinite(edge.distance) || edge.distance < 0) {
      throw new Error(`Invalid passage distance: ${edge.from} → ${edge.to}.`);
    }
    // This is the public visitor router, irrespective of the signed-in role.
    // Filter restrictions before Dijkstra, not after choosing a shortest path.
    if (edge.access === "staff" || edge.available === false) continue;
    from.push({ to: edge.to, distance: edge.distance });
    if (edge.bidirectional !== false) {
      to.push({ to: edge.from, distance: edge.distance });
    }
  }
  if (!adjacency.has(startId) || !adjacency.has(destinationId)) {
    throw new Error("The route start or destination does not exist.");
  }

  const pending = new Set(adjacency.keys());
  const distances = new Map<string, number>([[startId, 0]]);
  const previous = new Map<string, string>();

  while (pending.size) {
    let current: string | undefined;
    let bestDistance = Infinity;
    for (const id of pending) {
      const distance = distances.get(id) ?? Infinity;
      if (distance < bestDistance) {
        current = id;
        bestDistance = distance;
      }
    }
    if (current === undefined) return null;
    if (current === destinationId) {
      const nodes = [current];
      while (previous.has(current)) {
        current = previous.get(current)!;
        nodes.push(current);
      }
      return { nodes: nodes.reverse(), totalDistance: bestDistance };
    }
    pending.delete(current);
    for (const neighbor of adjacency.get(current)!) {
      if (!pending.has(neighbor.to)) continue;
      const candidate = bestDistance + neighbor.distance;
      if (candidate < (distances.get(neighbor.to) ?? Infinity)) {
        distances.set(neighbor.to, candidate);
        previous.set(neighbor.to, current);
      }
    }
  }
  return null;
}
