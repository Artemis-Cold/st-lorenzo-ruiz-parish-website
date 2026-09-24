// Schematic coordinates transcribed from the user's current-use visualization.
// Both storeys share the same longitudinal scale. These are NOT surveyed metres.
// The architectural Basement Plan = floor 1; Ground Floor Plan = floor 2.
export const parishPoints = {
  b_front_left: {
    name: "Left Stairs — 1st Floor",
    floorId: "basement",
    x: 2,
    y: 26,
  },
  b_front_right: {
    name: "Right Stairs — 1st Floor",
    floorId: "basement",
    x: 18,
    y: 26,
  },
  b_front_hall: {
    name: "Multipurpose Hall front approach",
    floorId: "basement",
    x: 10,
    y: 25,
  },
  b_multipurpose: {
    name: "Multipurpose Hall",
    floorId: "basement",
    x: 10,
    y: 23,
  },
  b_office: {
    name: "Parish Office",
    floorId: "basement",
    x: 5,
    y: 28,
  },
  b_store: { name: "Parish Store", floorId: "basement", x: 15, y: 28 },
  b_function: {
    name: "Function Hall",
    floorId: "basement",
    x: 10,
    y: 12,
  },
  b_rear_left: {
    name: "Rear-left stairs — staff only",
    floorId: "basement",
    x: 1,
    y: 3,
  },
  b_rear_right: {
    name: "Rear-right stairs — staff only",
    floorId: "basement",
    x: 19,
    y: 3,
  },
  c_front_left: {
    name: "Left Stairs — 2nd Floor",
    floorId: "church",
    x: 2,
    y: 26,
  },
  c_front_right: {
    name: "Right Stairs — 2nd Floor",
    floorId: "church",
    x: 18,
    y: 26,
  },
  c_church: { name: "Main Church entrance", floorId: "church", x: 10, y: 24 },
  c_left_aisle: { name: "Left Aisle", floorId: "church", x: 4, y: 16 },
  c_right_aisle: {
    name: "Right Aisle",
    floorId: "church",
    x: 16,
    y: 16,
  },
  c_altar: { name: "Altar", floorId: "church", x: 10, y: 9 },
  c_choir: {
    name: "Choir Stand",
    floorId: "church",
    x: 5,
    y: 8,
  },
  c_sacristy: {
    name: "Sacristy",
    floorId: "church",
    x: 16,
    y: 8,
  },
  c_candle: { name: "Candle Stand", floorId: "church", x: 19, y: 12 },
  c_rear_left: {
    name: "Altar-side left stairs — staff only",
    floorId: "church",
    x: 1,
    y: 3,
  },
  c_rear_right: {
    name: "Altar-side right stairs — staff only",
    floorId: "church",
    x: 19,
    y: 3,
  },
  outside_left: {
    name: "Left ramp — outside ground-level start",
    floorId: "outside",
    x: -3,
    y: 30,
  },
  outside_right: {
    name: "Right ramp — outside ground-level start",
    floorId: "outside",
    x: 23,
    y: 30,
  },
  bell_entry: {
    name: "Bell Tower",
    floorId: "basement",
    x: 28,
    y: 17,
  },
  comfort_entry: { name: "Comfort Room", floorId: "basement", x: 28, y: 25 },
} as const;

export type ParishNodeId = keyof typeof parishPoints;
export const parishLayout = Object.fromEntries(
  Object.entries(parishPoints).map(([id, { x, y }]) => [id, { x, y }]),
);
