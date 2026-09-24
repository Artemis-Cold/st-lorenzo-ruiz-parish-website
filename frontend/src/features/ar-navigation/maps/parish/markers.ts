import { parishPoints, type ParishNodeId } from "./layout.ts";
// FINAL USER DIAGRAM, set 2: 16 scan points, ten destinations.
// Facing is the user's scanning direction clockwise from the TOP OF THE PLAN.
// These are not compass bearings or continuous phone-heading measurements.
const placements: readonly [ParishNodeId, number, string][] = [
  ["b_front_left", 0, "Left Stairs, 1st-floor landing. Face up the plan."],
  ["b_front_right", 0, "Right Stairs, 1st-floor landing. Face up the plan."],
  [
    "b_multipurpose",
    0,
    "Multipurpose Hall front boundary, at the drawn marker. Face up the plan.",
  ],
  [
    "b_office",
    270,
    "Parish Office entrance on its right side. Face left on the plan.",
  ],
  [
    "b_store",
    90,
    "Parish Store entrance on its left side. Face right on the plan.",
  ],
  [
    "b_function",
    0,
    "Function Hall entrance, approached from Multipurpose Hall. Face up the plan.",
  ],
  [
    "c_front_left",
    90,
    "Left Stairs, 2nd-floor landing. Face right toward the front approach.",
  ],
  [
    "c_front_right",
    270,
    "Right Stairs, 2nd-floor landing. Face left toward the front approach.",
  ],
  [
    "c_left_aisle",
    0,
    "Left Aisle at the drawn public aisle point. Face up the plan.",
  ],
  [
    "c_right_aisle",
    0,
    "Right Aisle at the drawn public aisle point. Face up the plan.",
  ],
  [
    "c_altar",
    0,
    "Public boundary in front of the Altar. Face up the plan; do not enter the sanctuary.",
  ],
  [
    "c_choir",
    270,
    "Choir Stand public-side entrance beside the Altar. Face left on the plan.",
  ],
  [
    "c_sacristy",
    90,
    "Sacristy public-side entrance beside the Altar. Face right on the plan.",
  ],
  [
    "c_candle",
    90,
    "Candle Stand public approach on the right side. Face right on the plan.",
  ],
  [
    "bell_entry",
    90,
    "Bell Tower approach on its left side, via the Multipurpose Hall walkway. Face right.",
  ],
  [
    "comfort_entry",
    90,
    "Shared Comfort Room approach outside the boys/girls corridor, via Multipurpose Hall. Face right.",
  ],
];
export const parishMarkers = placements.map(
  ([nodeId, facing, placement], targetIndex) => ({
    nodeId,
    targetIndex,
    code: `P${String(targetIndex).padStart(2, "0")}`,
    name: parishPoints[nodeId].name,
    floorId: parishPoints[nodeId].floorId,
    placement,
    facing,
  }),
);
