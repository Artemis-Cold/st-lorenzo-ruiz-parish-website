import type { NavigationGraph } from "../../types/checkpointNavigation.ts";

/**
 * Topology follows the supplied floor-plan openings (September 2026).
 * Distances are configurable walking estimates, not measurements from the image:
 * its proportions and dimension labels are not consistently to scale.
 * Edges describe walking passages, not straight lines between room centres.
 * Destination entry nodes represent the accessible side of each threshold;
 * hallway nodes describe routing geometry, not additional room destinations.
 * Legacy interior nodes remain for passage geometry and route-engine fixtures.
 */
export const houseGraph: NavigationGraph = {
  nodes: [
    { id: "terrace_entry", name: "Terrace" },
    { id: "terrace_door", name: "Terrace upper-left opening" },
    { id: "living_left_entry", name: "Living Room lower-left opening" },
    { id: "living_right_entry", name: "Living Room lower-right opening" },
    { id: "living_room", name: "Living Room" },
    { id: "dining_room", name: "Dining Room" },
    { id: "upper_hall", name: "Upper hallway" },
    { id: "left_hall_upper", name: "Upper-left intersection" },
    { id: "right_hall_upper", name: "Upper-right intersection" },
    { id: "left_hall_middle", name: "Hall outside Room 2" },
    { id: "left_hall_room_1", name: "Hall outside Room 1" },
    { id: "right_hall_middle", name: "Hall outside Room 3" },
    { id: "right_hall_room_4", name: "Hall outside Room 4" },
    { id: "left_hall_lower", name: "Lower-left intersection" },
    { id: "right_hall_lower", name: "Lower-right intersection" },
    { id: "kitchen_entry", name: "Kitchen" },
    { id: "room_1_entry", name: "Room 1" },
    { id: "room_2_entry", name: "Room 2" },
    { id: "room_3_entry", name: "Room 3" },
    { id: "room_4_entry", name: "Room 4" },
    { id: "bathroom_1_entry", name: "Bathroom 1" },
    { id: "bathroom_2_entry", name: "Bathroom 2" },
    { id: "bathroom_1_door", name: "Bathroom 1 opening inside Room 2" },
    {
      id: "bathroom_2_approach",
      name: "Dining area beside Bathroom 2 opening",
    },
    {
      id: "kitchen_approach",
      name: "Dining area beside Kitchen upper opening",
    },
  ],
  edges: [
    // The wall along the terrace's top is crossed only at its left-hand gap.
    { from: "terrace_entry", to: "terrace_door", distance: 2.5 },
    { from: "terrace_door", to: "left_hall_lower", distance: 0.5 },
    // Cross between side corridors through the lower interior of Living Room.
    { from: "left_hall_lower", to: "living_left_entry", distance: 1 },
    { from: "living_left_entry", to: "living_room", distance: 2.5 },
    { from: "living_room", to: "living_right_entry", distance: 2.5 },
    { from: "living_right_entry", to: "right_hall_lower", distance: 1 },
    // Separate corridor junctions from room arrival points.
    { from: "left_hall_lower", to: "left_hall_room_1", distance: 3 },
    { from: "left_hall_room_1", to: "room_1_entry", distance: 0.5 },
    { from: "left_hall_room_1", to: "left_hall_middle", distance: 1.5 },
    { from: "left_hall_middle", to: "room_2_entry", distance: 0.5 },
    { from: "left_hall_middle", to: "left_hall_upper", distance: 4 },
    { from: "right_hall_lower", to: "right_hall_room_4", distance: 3 },
    { from: "right_hall_room_4", to: "room_4_entry", distance: 0.5 },
    { from: "right_hall_room_4", to: "right_hall_middle", distance: 1.5 },
    { from: "right_hall_middle", to: "room_3_entry", distance: 0.5 },
    { from: "right_hall_middle", to: "right_hall_upper", distance: 4 },
    { from: "left_hall_upper", to: "upper_hall", distance: 3.5 },
    { from: "upper_hall", to: "right_hall_upper", distance: 3.5 },
    { from: "upper_hall", to: "dining_room", distance: 2.5 },
    // Walk north to the gap above the Kitchen's left wall before entering.
    { from: "right_hall_upper", to: "kitchen_approach", distance: 3.5 },
    { from: "kitchen_approach", to: "kitchen_entry", distance: 1 },
    // Bathroom 2 opens east into the dining area, not into Bathroom 1.
    { from: "left_hall_upper", to: "bathroom_2_approach", distance: 2.5 },
    { from: "bathroom_2_approach", to: "bathroom_2_entry", distance: 0.5 },
    // Bathroom 1's only drawn opening is in its bottom wall, inside Room 2.
    { from: "room_2_entry", to: "bathroom_1_door", distance: 3.5 },
    { from: "bathroom_1_door", to: "bathroom_1_entry", distance: 0.5 },
  ],
};
