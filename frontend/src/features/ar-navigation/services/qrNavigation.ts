import type { MapProfile, Checkpoint } from "../types/checkpointNavigation.ts";
import { calculateRoute } from "./routeEngine.ts";

export const qrPayload = (mapId: string, checkpointId: string) =>
  `slr-nav:v1:${mapId}:${checkpointId}`;

export function parseCheckpoint(
  value: string,
  profile: MapProfile,
): Checkpoint | null {
  if (value.length > 200) return null;
  return (
    profile.building.checkpoints.find(
      (point) =>
        point.targetIndex !== null && qrPayload(profile.id, point.id) === value,
    ) ?? null
  );
}

export function floorRoute(
  profile: MapProfile,
  checkpoint: Checkpoint,
  destinationId: string,
) {
  const building = profile.building;
  const destination = building.destinations.find((d) => d.id === destinationId);
  if (!destination) throw new Error("Choose a destination.");
  if (destination.nodeId === checkpoint.nodeId)
    return { nodes: [checkpoint.nodeId], nextFloor: null };
  const start = checkpoint.departureNodeId ?? checkpoint.nodeId;
  const route = calculateRoute(start, destination.nodeId, building.graph);
  if (!route) throw new Error("No public route is available.");
  if (
    profile.id === "parish" &&
    route.nodes.some((id) =>
      ["bell_entry", "comfort_entry", "outside_left", "outside_right"].includes(
        id,
      ),
    )
  ) {
    throw new Error(
      "This route needs on-site calibration. Please ask parish staff for directions.",
    );
  }
  const nodes = [route.nodes[0]];
  let nextFloor: string | null = null;
  for (const id of route.nodes.slice(1)) {
    const previous = building.graph.nodes.find((n) => n.id === nodes.at(-1));
    const current = building.graph.nodes.find((n) => n.id === id);
    if (previous?.floorId !== current?.floorId) {
      nextFloor =
        building.floors?.find((f) => f.id === current?.floorId)?.name ??
        "next floor";
      break;
    }
    nodes.push(id);
  }
  return { nodes, nextFloor };
}

/** Map-plane to XR metres. QR facing is clockwise from plan north.
 * Origin is the user's confirmed standing position, not the wall QR itself.
 */
export function worldRoute(
  points: readonly { x: number; y: number }[],
  facing: number,
  origin: { x: number; y: number; z: number },
  forward: { x: number; z: number },
) {
  if (!points.length || Math.hypot(forward.x, forward.z) < 0.1) return [];
  const angle = Math.atan2(-forward.x, -forward.z) + (facing * Math.PI) / 180;
  return points.map((point) => {
    const x = point.x - points[0].x,
      z = point.y - points[0].y;
    return {
      x: origin.x + x * Math.cos(angle) + z * Math.sin(angle),
      y: origin.y + 0.035,
      z: origin.z - x * Math.sin(angle) + z * Math.cos(angle),
    };
  });
}

export function metricPoints(profile: MapProfile, nodes: string[]) {
  // Main building plan: A–J grid width 25 m; grid 10–4 depth approximately
  // 26.9 m. Existing current-use nodes are fitted to that envelope, not a survey.
  // Outdoor points are deliberately blocked in floorRoute until calibrated.
  const scale =
    profile.id === "parish" ? { x: 25 / 18, y: 26.9 / 23 } : { x: 1, y: 1 };
  return nodes.map((id) => {
    const point = profile.building.layout[id];
    if (!point) throw new Error("Route coordinates are unavailable.");
    return { x: point.x * scale.x, y: point.y * scale.y };
  });
}
