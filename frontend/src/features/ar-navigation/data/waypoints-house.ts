import type { Waypoint, Edge } from "../types";

// Test dataset based on the user's house floor plan.
// Bearings assume "up in the floor plan image = North (0°)" — a placeholder,
// same convention used before it was corrected with real compass/satellite data.
// Since this is just a dummy test at home, walk it with a compass app open
// and adjust any bearing that feels wrong.

export const waypoints: Waypoint[] = [
  { id: "bathroom-2", label: "Bathroom 2", isDestinationOption: true },
  { id: "bathroom-1", label: "Bathroom 1", isDestinationOption: true },
  { id: "room-2", label: "Room 2", isDestinationOption: true },
  { id: "room-1", label: "Room 1", isDestinationOption: true },
  { id: "dining-room", label: "Dining Room", isDestinationOption: true },
  { id: "living-room", label: "Living Room", isDestinationOption: true },
  { id: "terrace", label: "Terrace", isDestinationOption: true },
  { id: "kitchen", label: "Kitchen", isDestinationOption: true },
  { id: "room-3", label: "Room 3", isDestinationOption: true },
  { id: "room-4", label: "Room 4", isDestinationOption: true },
];

export const edges: Edge[] = [
  // Left column, top to bottom
  { from: "bathroom-2", to: "bathroom-1", bearing: 180, instruction: "Walk down the hall" },
  { from: "bathroom-1", to: "bathroom-2", bearing: 0, instruction: "Walk up the hall" },

  { from: "bathroom-1", to: "room-2", bearing: 180, instruction: "Continue down the hall" },
  { from: "room-2", to: "bathroom-1", bearing: 0, instruction: "Walk back up" },

  { from: "room-2", to: "room-1", bearing: 180, instruction: "Continue down the hall" },
  { from: "room-1", to: "room-2", bearing: 0, instruction: "Walk back up" },

  // Left column <-> center (Dining/Living)
  { from: "bathroom-2", to: "dining-room", bearing: 90, instruction: "Turn right into the dining room" },
  { from: "dining-room", to: "bathroom-2", bearing: 270, instruction: "Turn left" },

  { from: "room-2", to: "living-room", bearing: 90, instruction: "Turn right into the living room" },
  { from: "living-room", to: "room-2", bearing: 270, instruction: "Turn left" },

  { from: "room-1", to: "living-room", bearing: 90, instruction: "Turn right into the living room" },
  { from: "living-room", to: "room-1", bearing: 270, instruction: "Turn left" },

  // Center column
  { from: "dining-room", to: "living-room", bearing: 180, instruction: "Walk straight ahead" },
  { from: "living-room", to: "dining-room", bearing: 0, instruction: "Walk back" },

  { from: "dining-room", to: "kitchen", bearing: 90, instruction: "Turn right into the kitchen" },
  { from: "kitchen", to: "dining-room", bearing: 270, instruction: "Turn left" },

  // Right column
  { from: "kitchen", to: "room-3", bearing: 180, instruction: "Continue down the hall" },
  { from: "room-3", to: "kitchen", bearing: 0, instruction: "Walk back up" },

  { from: "room-3", to: "room-4", bearing: 180, instruction: "Continue down the hall" },
  { from: "room-4", to: "room-3", bearing: 0, instruction: "Walk back up" },

  { from: "living-room", to: "room-4", bearing: 90, instruction: "Turn right" },
  { from: "room-4", to: "living-room", bearing: 270, instruction: "Turn left" },

  // Down to the terrace via the corridor between Room 1 and the Living Room
  { from: "living-room", to: "terrace", bearing: 180, instruction: "Head down toward the terrace" },
  { from: "terrace", to: "living-room", bearing: 0, instruction: "Head back inside" },

  { from: "room-1", to: "terrace", bearing: 135, instruction: "Turn toward the terrace" },
  { from: "terrace", to: "room-1", bearing: 315, instruction: "Turn back toward Room 1" },
];