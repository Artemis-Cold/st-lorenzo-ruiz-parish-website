import type {
  NavigationLocation,
  NavigationMap,
  NavigationNode,
} from "../types/navigation";
import { distance3D } from "../utils/navigationMath";

/**
 * Prototype measurements transcribed from the supplied house sketch.
 * Doorway points are estimates until each doorway is measured on site.
 * All graph coordinates and dimensions are expressed in metres.
 */
export const houseSurvey = {
  footprint: {
    mainHouse: { widthMeters: 14, lengthMeters: 14 },
    terrace: { widthMeters: 7, lengthMeters: 5 },
  },
  interior: {
    centralAreaWidthMeters: 7,
    diningRoom: { widthMeters: 7, lengthMeters: 5 },
    livingRoom: { widthMeters: 5, lengthMeters: 8 },
    leftWing: {
      widthMeters: 3.5,
      bathroom2LengthMeters: 3,
      bathroom1LengthMeters: 2,
      bathroom1WidthMeters: 2.5,
      room2LengthMeters: 4.5,
      room1LengthMeters: 4.5,
    },
    rightWing: {
      widthMeters: 3.5,
      kitchenLengthMeters: 5,
      room3LengthMeters: 4.5,
      room4LengthMeters: 4.5,
    },
  },
} as const;

const nodes: NavigationNode[] = [
  // Upper route around the Living Room.
  { id: 1, floorId: 1, name: "Room 3 Doorway", x: 3.5, y: 0, z: 2 },
  { id: 2, floorId: 1, name: "Upper-right turn", x: 3.5, y: 0, z: -2 },
  { id: 3, floorId: 1, name: "Upper hallway centre", x: 0, y: 0, z: -2 },
  { id: 4, floorId: 1, name: "Upper-left turn", x: -3.5, y: 0, z: -2 },
  { id: 5, floorId: 1, name: "Room 2 Doorway", x: -3.5, y: 0, z: 2 },

  // Upper rooms.
  { id: 6, floorId: 1, name: "Kitchen", x: 3.5, y: 0, z: -4.5 },
  { id: 7, floorId: 1, name: "Dining Room", x: 0, y: 0, z: -4.5 },
  { id: 8, floorId: 1, name: "Bathroom 1", x: -3.5, y: 0, z: -3 },
  { id: 9, floorId: 1, name: "Bathroom 2", x: -3.5, y: 0, z: -5.5 },

  // Side and lower route around the Living Room.
  { id: 10, floorId: 1, name: "Room 4 Doorway", x: 3.5, y: 0, z: 4.75 },
  { id: 11, floorId: 1, name: "Lower-right turn", x: 3.5, y: 0, z: 7 },
  { id: 12, floorId: 1, name: "Lower hallway centre", x: 0, y: 0, z: 7 },
  { id: 13, floorId: 1, name: "Lower-left turn", x: -3.5, y: 0, z: 7 },
  { id: 14, floorId: 1, name: "Room 1 Doorway", x: -3.5, y: 0, z: 4.75 },

  // Central destinations reached from the lower hallway.
  { id: 15, floorId: 1, name: "Terrace", x: 0, y: 0, z: 9.5 },
  { id: 16, floorId: 1, name: "Living Room", x: 2.25, y: 0, z: 5.5 },
  { id: 17, floorId: 1, name: "Living Room entrance", x: 2.25, y: 0, z: 7 },
];

const connectedNodes = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [2, 6],
  [3, 7],
  [4, 8],
  [8, 9],
  [1, 10],
  [10, 11],
  [11, 12],
  [12, 13],
  [13, 14],
  [14, 5],
  [12, 15],
  [12, 17],
  [17, 16],
] as const;

const locations: NavigationLocation[] = [
  {
    id: "room-1",
    name: "Room 1",
    description: "Room 1 doorway in the lower-left wing",
    nodeId: 14,
  },
  {
    id: "room-2",
    name: "Room 2",
    description: "Room 2 doorway in the middle-left wing",
    nodeId: 5,
  },
  {
    id: "room-3",
    name: "Room 3",
    description: "Room 3 doorway in the middle-right wing",
    nodeId: 1,
  },
  {
    id: "room-4",
    name: "Room 4",
    description: "Room 4 doorway in the lower-right wing",
    nodeId: 10,
  },
  {
    id: "bathroom-1",
    name: "Bathroom 1",
    description: "Bathroom beside Room 2",
    nodeId: 8,
  },
  {
    id: "bathroom-2",
    name: "Bathroom 2",
    description: "Bathroom in the upper-left wing",
    nodeId: 9,
  },
  {
    id: "dining-room",
    name: "Dining Room",
    description: "Dining area at the upper centre of the house",
    nodeId: 7,
  },
  {
    id: "kitchen",
    name: "Kitchen",
    description: "Kitchen in the upper-right wing",
    nodeId: 6,
  },
  {
    id: "living-room",
    name: "Living Room",
    description: "Living Room entrance from the lower hallway",
    nodeId: 16,
  },
  {
    id: "terrace",
    name: "Terrace",
    description: "Covered terrace at the front of the house",
    nodeId: 15,
  },
];

const nodesById = new Map(nodes.map((node) => [node.id, node]));

export const houseNavigationMap: NavigationMap = {
  floors: [{ id: 1, name: "House Ground Floor", level: 0 }],
  nodes,
  edges: connectedNodes.map(([from, to]) => ({
    from,
    to,
    distance: distance3D(nodesById.get(from)!, nodesById.get(to)!),
    bidirectional: true,
  })),
  locations,
};
