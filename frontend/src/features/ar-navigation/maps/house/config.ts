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
  (node) => {
    const marker = markerManifest.find((item) => item.nodeId === node.id);

    return {
      id: node.id,
      nodeId: node.id,
      departureNodeId: marker?.departureNodeId,
      name: marker?.name ?? node.name,
      targetIndex: targetNodes.includes(node.id)
        ? targetNodes.indexOf(node.id)
        : null,
      facing: marker?.facing ?? 0,
    };
  },
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
