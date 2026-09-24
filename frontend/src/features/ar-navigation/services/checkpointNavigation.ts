import type {
  BuildingConfig,
  CheckpointNavigationState,
  NavigationInstruction,
} from "../types/checkpointNavigation.ts";
import { calculateRoute } from "./routeEngine.ts";

export type NavigationEvent =
  | { type: "destination"; id: string }
  | { type: "found"; id: string }
  | { type: "lost"; id: string }
  | { type: "reset" };

export function initialNavigation(
  destinationId: string,
): CheckpointNavigationState {
  return {
    destinationId,
    currentCheckpointId: null,
    visibleCheckpointId: null,
    route: null,
    message:
      "Scan a nearby navigation marker to determine your current location.",
  };
}

export function transitionNavigation(
  state: CheckpointNavigationState,
  event: NavigationEvent,
  building: BuildingConfig,
): CheckpointNavigationState {
  if (event.type === "reset") return initialNavigation(state.destinationId);
  if (event.type === "lost") {
    return state.visibleCheckpointId === event.id
      ? { ...state, visibleCheckpointId: null }
      : state;
  }
  const destinationId =
    event.type === "destination" ? event.id : state.destinationId;
  const destination = building.destinations.find(
    (item) => item.id === destinationId,
  );
  if (!destination) return state;
  const checkpointId =
    event.type === "found" ? event.id : state.currentCheckpointId;
  const checkpoint = building.checkpoints.find(
    (item) => item.id === checkpointId,
  );
  if (event.type === "found" && !checkpoint) return state;
  if (!checkpoint) return { ...state, destinationId };
  if (event.type === "found" && state.currentCheckpointId === event.id) {
    return state.visibleCheckpointId === event.id
      ? state
      : { ...state, visibleCheckpointId: event.id };
  }
  const route = calculateRoute(
    checkpoint.nodeId,
    destination.nodeId,
    building.graph,
  );
  const expected = state.route?.nodes.slice(1).includes(checkpoint.nodeId);
  return {
    destinationId,
    currentCheckpointId: checkpoint.id,
    visibleCheckpointId:
      event.type === "found" ? checkpoint.id : state.visibleCheckpointId,
    route,
    message: !route
      ? "No connected route to this destination. Choose another destination."
      : route.nodes.length === 1
        ? "Destination reached."
        : event.type === "destination"
          ? "Destination changed. Route updated."
          : !state.currentCheckpointId
            ? "Location confirmed."
            : expected
              ? "Checkpoint confirmed. Route updated."
              : "Location updated. Route recalculated.",
  };
}

export function navigationInstruction(
  state: CheckpointNavigationState,
  building: BuildingConfig,
): NavigationInstruction | null {
  if (!state.route) return null;
  if (state.route.nodes.length === 1)
    return {
      direction: "destination",
      label: "Destination reached",
      distance: 0,
      next: null,
    };
  const [from, to] = state.route.nodes;
  const a = building.layout[from];
  const b = building.layout[to];
  const checkpoint = building.checkpoints.find(
    (item) => item.id === state.currentCheckpointId,
  );
  const edge = building.graph.edges.find(
    (item) =>
      item.access !== "staff" &&
      item.available !== false &&
      ((item.from === from && item.to === to) ||
        (item.bidirectional !== false && item.to === from && item.from === to)),
  );
  const fromFloor = building.floors?.find(
    (floor) =>
      floor.id ===
      building.graph.nodes.find((node) => node.id === from)?.floorId,
  );
  const toFloor = building.floors?.find(
    (floor) =>
      floor.id === building.graph.nodes.find((node) => node.id === to)?.floorId,
  );
  if (fromFloor && toFloor && fromFloor.id !== toFloor.id) {
    const transition = edge?.kind === "ramp" ? "ramp" : "stairs";
    const action = toFloor.level > fromFloor.level ? "up" : "down";
    return {
      direction: "unknown",
      label: `Take the ${transition} ${action} to ${toFloor.name}`,
      distance: edge?.distance ?? 0,
      next: building.graph.nodes.find((node) => node.id === to)?.name ?? to,
      transition,
    };
  }
  const angle =
    a && b && checkpoint
      ? (((Math.atan2(b.x - a.x, a.y - b.y) * 180) / Math.PI -
          checkpoint.facing +
          540) %
          360) -
        180
      : null;
  const direction =
    angle === null
      ? "unknown"
      : Math.abs(angle) >= 150
        ? "back"
        : angle > 25
          ? "right"
          : angle < -25
            ? "left"
            : "straight";
  const label = {
    unknown: "Follow the listed route",
    back: "Turn around",
    right: "Turn right",
    left: "Turn left",
    straight: "Go straight",
  }[direction];
  return {
    direction,
    label,
    distance: edge?.distance ?? 0,
    next: building.graph.nodes.find((item) => item.id === to)?.name ?? to,
  };
}
