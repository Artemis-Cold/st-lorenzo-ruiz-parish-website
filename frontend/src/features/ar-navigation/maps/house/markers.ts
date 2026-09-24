// Stable compiler order: each printed image maps to exactly one physical scan point.
export const markerManifest = [
  {
    nodeId: "terrace_door",
    name: "Terrace entrance",
    placement: "At the upper-left Terrace opening, on the accessible side.",
  },
  {
    nodeId: "living_left_entry",
    name: "Living Room entrance",
    placement: "At the lower-left Living Room opening, facing the corridor.",
  },
  {
    nodeId: "upper_hall",
    name: "Dining Room entrance",
    placement:
      "At the central approach to the open Dining Room, above the Living Room wall.",
  },
  {
    nodeId: "left_hall_upper",
    name: "Left Hall",
    placement: "At the upper-left hallway intersection.",
  },
  {
    nodeId: "right_hall_upper",
    name: "Right Hall",
    placement: "At the upper-right hallway intersection.",
  },
  {
    nodeId: "kitchen_entry",
    name: "Kitchen entrance",
    placement: "Outside the Kitchen doorway at the upper end of its left wall.",
  },
  {
    nodeId: "room_1_entry",
    name: "Room 1 entrance",
    placement: "Outside the Room 1 doorway, visible from the left corridor.",
  },
  {
    nodeId: "room_2_entry",
    name: "Room 2 entrance",
    placement: "Outside the Room 2 doorway, visible from the left corridor.",
  },
  {
    nodeId: "room_3_entry",
    name: "Room 3 entrance",
    placement: "Outside the Room 3 doorway, visible from the right corridor.",
  },
  {
    nodeId: "room_4_entry",
    name: "Room 4 entrance",
    placement: "Outside the Room 4 doorway, visible from the right corridor.",
  },
  {
    nodeId: "bathroom_1_door",
    name: "Bathroom 1 entrance",
    placement:
      "Outside the Bathroom 1 doorway, on the Room 2 side. Requires access to Room 2.",
  },
  {
    nodeId: "bathroom_2_entry",
    name: "Bathroom 2 entrance",
    placement:
      "Outside the Bathroom 2 doorway, visible from the Dining Room side.",
  },
] as const;
