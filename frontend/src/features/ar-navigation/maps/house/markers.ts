// Stable compiler order: each printed image maps to exactly one physical scan point.
// Facing is clockwise from the top of the supplied floor plan:
// 0 = up, 90 = right, 180 = down, 270 = left.
export const markerManifest = [
  {
    nodeId: "terrace_door",
    departureNodeId: "terrace_door",
    name: "Terrace entrance",
    facing: 0,
    placement:
      "Terrace side of the central Living Room opening. Face up toward the Living Room.",
  },
  {
    nodeId: "living_room",
    departureNodeId: "living_room",
    name: "Living Room entrance",
    facing: 180,
    placement:
      "Living Room side of the central Terrace opening. Face down toward the Terrace.",
  },
  {
    nodeId: "upper_hall",
    departureNodeId: "upper_hall",
    name: "Dining Room entrance",
    facing: 180,
    placement:
      "Dining Room side of the central Living Room boundary. Face down toward the Living Room.",
  },
  {
    nodeId: "kitchen_entry",
    departureNodeId: "kitchen_approach",
    name: "Kitchen entrance",
    facing: 90,
    placement:
      "Outside the Kitchen doorway on its left wall. Face right into the Kitchen.",
  },
  {
    nodeId: "room_1_entry",
    departureNodeId: "left_hall_room_1",
    name: "Room 1 entrance",
    facing: 270,
    placement:
      "Outside the Room 1 doorway on its right wall. Face left into Room 1.",
  },
  {
    nodeId: "room_2_entry",
    departureNodeId: "left_hall_middle",
    name: "Room 2 entrance",
    facing: 270,
    placement:
      "Outside the Room 2 doorway on its right wall. Face left into Room 2.",
  },
  {
    nodeId: "room_3_entry",
    departureNodeId: "right_hall_middle",
    name: "Room 3 entrance",
    facing: 90,
    placement:
      "Outside the Room 3 doorway on its left wall. Face right into Room 3.",
  },
  {
    nodeId: "room_4_entry",
    departureNodeId: "right_hall_room_4",
    name: "Room 4 entrance",
    facing: 90,
    placement:
      "Outside the Room 4 doorway on its left wall. Face right into Room 4.",
  },
  {
    nodeId: "bathroom_1_door",
    departureNodeId: "room_2_entry",
    name: "Bathroom 1 entrance",
    facing: 0,
    placement:
      "Room 2 side of the Bathroom 1 doorway. Face up into Bathroom 1.",
  },
  {
    nodeId: "bathroom_2_entry",
    departureNodeId: "bathroom_2_approach",
    name: "Bathroom 2 entrance",
    facing: 270,
    placement:
      "Dining Room side of the Bathroom 2 doorway on its right wall. Face left into Bathroom 2.",
  },
] as const;
