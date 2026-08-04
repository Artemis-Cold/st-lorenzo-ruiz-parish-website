// src/ar-navigation/data/waypoints.ts

import type { Waypoint, Edge } from "../types";

export const waypoints: Waypoint[] = [
  // Ground floor
  { id: "ground-entrance", label: "Main Entrance (Ground Floor)" },
  { id: "multipurpose-hall", label: "Multipurpose Hall" },
  { id: "function-hall", label: "Function Hall", isDestinationOption: true },
  { id: "parish-office", label: "Parish Office", isDestinationOption: true },
  { id: "parish-store", label: "Parish Store", isDestinationOption: true },
  { id: "central-stairs-ground", label: "Stairs (Ground Level)" },

  // Second floor
  { id: "central-stairs-upper", label: "Stairs (2nd Floor Landing)" },
  { id: "main-church", label: "Main Church", isDestinationOption: true },
  { id: "altar", label: "Altar", isDestinationOption: true },
  { id: "choir-stand", label: "Choir Stand", isDestinationOption: true },
  { id: "sacristy", label: "Sacristy", isDestinationOption: true },
  { id: "candle-stand", label: "Candle Stand", isDestinationOption: true },

  // Standalone restroom/bell tower building
  { id: "restroom-building-entrance", label: "Restrooms / Bell Tower Building" },
  { id: "bell-tower", label: "Bell Tower" },
  { id: "cr-boys", label: "CR - Boys", isDestinationOption: true },
  { id: "cr-girls", label: "CR - Girls", isDestinationOption: true },
];

export const edges: Edge[] = [
  // --- Ground floor ---
  // Entrance faces the driveway (true North). Walking INTO the building
  // from the entrance means walking away from the driveway, i.e. South (180°).
  { from: "ground-entrance", to: "multipurpose-hall", bearing: 180, instruction: "Walk straight in" },
  { from: "multipurpose-hall", to: "ground-entrance", bearing: 0, instruction: "Head back to the entrance" },

  { from: "multipurpose-hall", to: "function-hall", bearing: 180, instruction: "Continue straight ahead" },
  { from: "function-hall", to: "multipurpose-hall", bearing: 0, instruction: "Head back" },

  { from: "multipurpose-hall", to: "central-stairs-ground", bearing: 0, instruction: "Turn around toward the stairs" },
  { from: "central-stairs-ground", to: "multipurpose-hall", bearing: 180, instruction: "Enter the multipurpose hall" },

  { from: "central-stairs-ground", to: "parish-office", bearing: 90, instruction: "Turn left" },
  { from: "parish-office", to: "central-stairs-ground", bearing: 270, instruction: "Exit toward the stairs" },

  { from: "central-stairs-ground", to: "parish-store", bearing: 270, instruction: "Turn right" },
  { from: "parish-store", to: "central-stairs-ground", bearing: 90, instruction: "Exit toward the stairs" },

  // --- Vertical connection ---
  // Bearing is less meaningful on stairs (mostly vertical motion) — kept
  // consistent with the rotation, but fine to treat as "just go up/down."
  { from: "central-stairs-ground", to: "central-stairs-upper", bearing: 180, instruction: "Go up the stairs" },
  { from: "central-stairs-upper", to: "central-stairs-ground", bearing: 180, instruction: "Go down the stairs" },

  // --- Second floor ---
  { from: "central-stairs-upper", to: "main-church", bearing: 180, instruction: "Walk into the main church" },
  { from: "main-church", to: "central-stairs-upper", bearing: 0, instruction: "Head back to the stairs" },

  { from: "main-church", to: "altar", bearing: 180, instruction: "Walk toward the altar" },
  { from: "altar", to: "main-church", bearing: 0, instruction: "Step back toward the main hall" },

  { from: "altar", to: "choir-stand", bearing: 90, instruction: "Turn right" },
  { from: "choir-stand", to: "altar", bearing: 270, instruction: "Turn left" },

  { from: "altar", to: "sacristy", bearing: 270, instruction: "Turn left" },
  { from: "sacristy", to: "altar", bearing: 90, instruction: "Turn right" },

  { from: "main-church", to: "candle-stand", bearing: 225, instruction: "Turn right" },
  { from: "candle-stand", to: "main-church", bearing: 45, instruction: "Turn left" },

  // --- Standalone restroom/bell tower building ---
  // Estimated from satellite imagery: sits roughly west, slightly north
  // of the main entrance. Good enough to start; refine on-site with a
  // compass app if you want tighter accuracy.
  { from: "ground-entrance", to: "restroom-building-entrance", bearing: 290, instruction: "Head to the restroom building" },
  { from: "restroom-building-entrance", to: "ground-entrance", bearing: 110, instruction: "Head back to the main entrance" },

  { from: "restroom-building-entrance", to: "bell-tower", bearing: 180, instruction: "Bell tower is ahead" },
  { from: "bell-tower", to: "restroom-building-entrance", bearing: 0, instruction: "Head back" },

  { from: "restroom-building-entrance", to: "cr-boys", bearing: 270, instruction: "Turn right" },
  { from: "cr-boys", to: "restroom-building-entrance", bearing: 90, instruction: "Exit" },

  { from: "restroom-building-entrance", to: "cr-girls", bearing: 90, instruction: "Turn left" },
  { from: "cr-girls", to: "restroom-building-entrance", bearing: 270, instruction: "Exit" },
];