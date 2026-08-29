import type { NavigationEdge, NavigationNode } from "../types/navigation";
import { distance3D } from "../utils/navigationMath";

interface Neighbor {
  nodeId: number;
  distance: number;
}

function buildAdjacency(edges: NavigationEdge[]) {
  const adjacency = new Map<number, Neighbor[]>();

  const connect = (from: number, to: number, distance: number) => {
    const neighbors = adjacency.get(from) ?? [];
    neighbors.push({ nodeId: to, distance });
    adjacency.set(from, neighbors);
  };

  edges.forEach((edge) => {
    connect(edge.from, edge.to, edge.distance);
    if (edge.bidirectional !== false) {
      connect(edge.to, edge.from, edge.distance);
    }
  });

  return adjacency;
}

function reconstructPath(previous: Map<number, number>, currentNodeId: number) {
  const path = [currentNodeId];
  let current = currentNodeId;

  while (previous.has(current)) {
    current = previous.get(current)!;
    path.unshift(current);
  }

  return path;
}

export function findRoute(
  nodes: NavigationNode[],
  edges: NavigationEdge[],
  startNodeId: number,
  destinationNodeId: number,
): number[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const start = nodesById.get(startNodeId);
  const destination = nodesById.get(destinationNodeId);

  if (!start || !destination) {
    throw new Error("The route start or destination node does not exist.");
  }

  if (startNodeId === destinationNodeId) return [startNodeId];

  const adjacency = buildAdjacency(edges);
  const open = new Set<number>([startNodeId]);
  const previous = new Map<number, number>();
  const costFromStart = new Map<number, number>([[startNodeId, 0]]);
  const estimatedTotal = new Map<number, number>([
    [startNodeId, distance3D(start, destination)],
  ]);

  while (open.size > 0) {
    const current = [...open].reduce((best, nodeId) =>
      (estimatedTotal.get(nodeId) ?? Number.POSITIVE_INFINITY) <
      (estimatedTotal.get(best) ?? Number.POSITIVE_INFINITY)
        ? nodeId
        : best,
    );

    if (current === destinationNodeId) {
      return reconstructPath(previous, current);
    }

    open.delete(current);

    for (const neighbor of adjacency.get(current) ?? []) {
      const tentativeCost =
        (costFromStart.get(current) ?? Number.POSITIVE_INFINITY) +
        neighbor.distance;

      if (
        tentativeCost >=
        (costFromStart.get(neighbor.nodeId) ?? Number.POSITIVE_INFINITY)
      ) {
        continue;
      }

      previous.set(neighbor.nodeId, current);
      costFromStart.set(neighbor.nodeId, tentativeCost);
      estimatedTotal.set(
        neighbor.nodeId,
        tentativeCost +
          distance3D(nodesById.get(neighbor.nodeId)!, destination),
      );
      open.add(neighbor.nodeId);
    }
  }

  return [];
}

export function routeNodesFromIds(
  nodes: NavigationNode[],
  routeNodeIds: number[],
) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  return routeNodeIds.map((nodeId) => {
    const node = nodesById.get(nodeId);
    if (!node) throw new Error(`Navigation node ${nodeId} does not exist.`);
    return node;
  });
}
