import type { Destination } from "../../types/checkpointNavigation.ts";

export const houseDestinations: readonly Destination[] = [
  { id: "dining-room", name: "Dining Room", nodeId: "upper_hall" },
  { id: "living-room", name: "Living Room", nodeId: "living_left_entry" },
  { id: "kitchen", name: "Kitchen", nodeId: "kitchen_entry" },
  { id: "room-1", name: "Room 1", nodeId: "room_1_entry" },
  { id: "room-2", name: "Room 2", nodeId: "room_2_entry" },
  { id: "room-3", name: "Room 3", nodeId: "room_3_entry" },
  { id: "room-4", name: "Room 4", nodeId: "room_4_entry" },
  { id: "bathroom-1", name: "Bathroom 1", nodeId: "bathroom_1_door" },
  { id: "bathroom-2", name: "Bathroom 2", nodeId: "bathroom_2_entry" },
  { id: "terrace", name: "Terrace", nodeId: "terrace_door" },
];
