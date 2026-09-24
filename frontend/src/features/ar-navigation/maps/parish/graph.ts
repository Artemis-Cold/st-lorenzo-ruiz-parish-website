import type {
  GraphEdge,
  NavigationGraph,
} from "../../types/checkpointNavigation.ts";
import { parishPoints, type ParishNodeId } from "./layout.ts";

// Relative costs for route preview, not measured walking distances.
const passage = (
  from: ParishNodeId,
  to: ParishNodeId,
  distance: number,
  options: Partial<Pick<GraphEdge, "kind" | "access" | "available">> = {},
): GraphEdge => ({ from, to, distance, ...options });

export const parishGraph: NavigationGraph = {
  nodes: Object.entries(parishPoints).map(([id, point]) => ({
    id,
    name: point.name,
    floorId: point.floorId,
  })),
  edges: [
    passage("b_front_left", "b_front_hall", 8),
    passage("b_front_right", "b_front_hall", 8),
    passage("b_front_left", "b_office", 2),
    passage("b_front_right", "b_store", 2),
    passage("b_front_hall", "b_multipurpose", 2),
    passage("b_multipurpose", "b_function", 11),
    // Both front stairs are public and bidirectional, regardless of their labels.
    passage("b_front_left", "c_front_left", 6, { kind: "stairs" }),
    passage("b_front_right", "c_front_right", 6, { kind: "stairs" }),
    passage("c_front_left", "c_church", 8),
    passage("c_front_right", "c_church", 8),
    passage("c_church", "c_left_aisle", 10),
    passage("c_church", "c_right_aisle", 10),
    passage("c_left_aisle", "c_choir", 8),
    passage("c_left_aisle", "c_altar", 9),
    passage("c_right_aisle", "c_altar", 9),
    passage("c_right_aisle", "c_sacristy", 8),
    passage("c_right_aisle", "c_candle", 5),
    // Outside approach only: no invented ramp connection from the basement.
    passage("outside_left", "c_front_left", 12, { kind: "ramp" }),
    passage("outside_right", "c_front_right", 12, { kind: "ramp" }),
    // Keep physical staff connections documented, but never in public routing.
    passage("b_function", "b_rear_left", 10, { access: "staff" }),
    passage("b_function", "b_rear_right", 10, { access: "staff" }),
    passage("b_rear_left", "c_rear_left", 1, {
      access: "staff",
      kind: "stairs",
    }),
    passage("b_rear_right", "c_rear_right", 1, {
      access: "staff",
      kind: "stairs",
    }),
    passage("c_rear_left", "c_choir", 1, { access: "staff" }),
    passage("c_rear_right", "c_sacristy", 1, { access: "staff" }),
    passage("b_multipurpose", "bell_entry", 12),
    passage("b_multipurpose", "comfort_entry", 10),
  ],
};
