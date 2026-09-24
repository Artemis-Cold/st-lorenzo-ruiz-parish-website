import type { BuildingConfig } from "../../types/checkpointNavigation.ts";
import { parishGraph } from "./graph.ts";
import { parishLayout } from "./layout.ts";
import { parishDestinations } from "./destinations.ts";
import { parishMarkers } from "./markers.ts";

export const parishBuilding: BuildingConfig = {
  graph: parishGraph,
  layout: parishLayout,
  destinations: parishDestinations,
  schematic: true,
  floors: [
    { id: "basement", name: "1st Floor — Basement", level: 1 },
    { id: "church", name: "2nd Floor — Main Church", level: 2 },
    { id: "outside", name: "Outside — ground level", level: 1 },
  ],
  checkpoints: parishMarkers.map((marker) => ({
    id: marker.nodeId,
    nodeId: marker.nodeId,
    name: marker.name,
    targetIndex: marker.targetIndex,
    facing: marker.facing,
  })),
};
