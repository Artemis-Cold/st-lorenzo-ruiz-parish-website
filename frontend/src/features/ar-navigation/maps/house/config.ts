import { houseGraph } from "./graph.ts";
import { houseDestinations } from "./destinations.ts";
import { markerManifest } from "./markers.ts";
import { layout } from "./layout.ts";
import type {
  BuildingConfig,
  Checkpoint,
} from "../../types/checkpointNavigation.ts";

// Interior graph points remain routing geometry, not additional room markers.
const targetNodes: readonly string[] = markerManifest.map(
  (marker) => marker.nodeId,
);
export const houseCheckpoints: readonly Checkpoint[] = houseGraph.nodes.map(
  (node) => ({
    id: node.id,
    nodeId: node.id,
    name:
      markerManifest.find((marker) => marker.nodeId === node.id)?.name ??
      node.name,
    targetIndex: targetNodes.includes(node.id)
      ? targetNodes.indexOf(node.id)
      : null,
    facing: 0,
  }),
);

export const houseBuilding: BuildingConfig = {
  graph: houseGraph,
  destinations: houseDestinations,
  checkpoints: houseCheckpoints,
  layout,
};

export const houseTargetIndices = houseCheckpoints.flatMap((checkpoint) =>
  checkpoint.targetIndex === null ? [] : [checkpoint.targetIndex],
);
