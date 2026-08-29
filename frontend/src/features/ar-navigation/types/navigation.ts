export interface NavigationPoint {
  x: number;
  y: number;
  z: number;
}

export interface NavigationFloor {
  id: number;
  name: string;
  level: number;
}

export interface NavigationNode extends NavigationPoint {
  id: number;
  floorId: number;
  name: string;
}

export interface NavigationEdge {
  from: number;
  to: number;
  distance: number;
  bidirectional?: boolean;
}

export interface NavigationDestination {
  id: string;
  name: string;
  description: string;
  nodeId: number;
  icon?: string;
}

export interface NavigationAnchor extends NavigationPoint {
  id: string;
  name: string;
  code: string;
  nodeId: number;
  floorId: number;
  rotationY: number;
}

export interface NavigationMap {
  floors: NavigationFloor[];
  nodes: NavigationNode[];
  edges: NavigationEdge[];
  destinations: NavigationDestination[];
  anchors: NavigationAnchor[];
}

export interface UserPose extends NavigationPoint {
  heading: number;
  pitch?: number;
  roll?: number;
  timestamp?: number;
}

export interface RouteSegment {
  index: number;
  from: NavigationNode;
  to: NavigationNode;
  length: number;
  startDistance: number;
  endDistance: number;
  heading: number;
}

export interface RouteGeometry {
  nodes: NavigationNode[];
  segments: RouteSegment[];
  totalDistance: number;
}

export interface ClosestRoutePoint extends NavigationPoint {
  segmentIndex: number;
  segmentProgress: number;
  routeDistance: number;
  distanceFromRoute: number;
}

export type TurnDirection = "left" | "right" | "straight" | "arrive";

export interface NavigationSnapshot {
  pose: UserPose;
  closestPoint: ClosestRoutePoint;
  currentSegment: RouteSegment;
  nextSegment: RouteSegment | null;
  desiredHeading: number;
  headingDifference: number;
  distanceToNextTurn: number;
  distanceRemaining: number;
  progress: number;
  turnDirection: TurnDirection;
  offRoute: boolean;
  arrived: boolean;
}
