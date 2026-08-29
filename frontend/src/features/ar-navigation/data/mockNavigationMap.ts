import type { NavigationMap } from "../types/navigation";
import { distance3D } from "../utils/navigationMath";

const nodes = [
  { id: 1, floorId: 1, name: "Main Entrance", x: 0, y: 0, z: 0 },
  { id: 2, floorId: 1, name: "Entrance Hall", x: 0, y: 0, z: 4 },
  { id: 3, floorId: 1, name: "Central Aisle", x: 4, y: 0, z: 4 },
  { id: 4, floorId: 1, name: "Nave Crossing", x: 4, y: 0, z: 9 },
  { id: 5, floorId: 1, name: "Parish Office Hall", x: 9, y: 0, z: 9 },
  { id: 6, floorId: 1, name: "Sacristy Hall", x: 4, y: 0, z: 14 },
  { id: 7, floorId: 1, name: "Sanctuary Corridor", x: 9, y: 0, z: 14 },
  { id: 8, floorId: 1, name: "Sacristy", x: 9, y: 0, z: 18 },
];

const connectedNodes = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [4, 6],
  [5, 7],
  [6, 7],
  [7, 8],
] as const;

export const mockNavigationMap: NavigationMap = {
  floors: [{ id: 1, name: "Ground Floor", level: 0 }],
  nodes,
  edges: connectedNodes.map(([from, to]) => ({
    from,
    to,
    distance: distance3D(
      nodes.find((node) => node.id === from)!,
      nodes.find((node) => node.id === to)!,
    ),
    bidirectional: true,
  })),
  destinations: [
    {
      id: "parish-office",
      name: "Parish Office",
      description: "Records, inquiries, and parish transactions",
      nodeId: 5,
    },
    {
      id: "sacristy",
      name: "Sacristy",
      description: "Preparation room beside the sanctuary",
      nodeId: 8,
    },
    {
      id: "sanctuary-corridor",
      name: "Sanctuary Corridor",
      description: "Corridor beside the main sanctuary",
      nodeId: 7,
    },
  ],
  anchors: [
    {
      id: "main-entrance",
      name: "Main Entrance",
      code: "MAIN_ENTRANCE",
      nodeId: 1,
      floorId: 1,
      x: 0,
      y: 0,
      z: 0,
      rotationY: 0,
    },
    {
      id: "central-aisle",
      name: "Central Aisle",
      code: "CENTRAL_AISLE",
      nodeId: 3,
      floorId: 1,
      x: 4,
      y: 0,
      z: 4,
      rotationY: 90,
    },
  ],
};
