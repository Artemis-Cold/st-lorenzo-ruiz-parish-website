/** Building-independent contracts for checkpoint routing. Distances are metres. */
export interface GraphNode {
  id: string;
  name: string;
  floorId?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  distance: number;
  /** Defaults to true. Set false for a one-way passage. */
  bidirectional?: boolean;
  access?: "public" | "staff";
  kind?: "walk" | "stairs" | "ramp";
  /** Unverified or closed passages are never used by public navigation. */
  available?: boolean;
}

export interface NavigationGraph {
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
}

export interface Destination {
  id: string;
  name: string;
  nodeId: string;
}

export interface CalculatedRoute {
  nodes: string[];
  totalDistance: number;
}

export type NavigationDirection =
  "straight" | "left" | "right" | "back" | "destination" | "unknown";

export interface NavigationInstruction {
  direction: NavigationDirection;
  /**
   * Signed clockwise angle from the user's marker scan-facing direction to
   * the next route leg. Zero points straight ahead; positive values point
   * right and negative values point left.
   */
  relativeAngle?: number;
  label: string;
  distance: number;
  next: string | null;
  transition?: "stairs" | "ramp";
}

export interface Checkpoint {
  id: string;
  nodeId: string;
  /**
   * Optional public-side route origin used after this marker is scanned.
   * Doorway markers can still confirm arrival at nodeId while navigation away
   * begins where the scanner is physically standing outside the doorway.
   */
  departureNodeId?: string;
  name: string;
  targetIndex: number | null;
  /** Facing clockwise from the top of the floor plan, after alignment. */
  facing: number;
}

export interface BuildingConfig {
  graph: NavigationGraph;
  destinations: readonly Destination[];
  checkpoints: readonly Checkpoint[];
  layout: Readonly<Record<string, { x: number; y: number }>>;
  floors?: readonly { id: string; name: string; level: number }[];
  /** Profiles using relative route costs instead of metre measurements. */
  schematic?: boolean;
}

export interface MarkerSet {
  targetsUrl: string;
  /** Number of images contained in the compiled target file. */
  targetCount?: number;
  printUrl: string;
  placementMapUrl?: string;
  markers: readonly {
    name: string;
    nodeId: string;
    placement: string;
    facing?: number;
    code?: string;
    url: string;
  }[];
}

export interface MapProfile {
  id: string;
  building: BuildingConfig;
  markerSet: MarkerSet | null;
  notice: string;
}

export interface CheckpointNavigationState {
  destinationId: string;
  currentCheckpointId: string | null;
  visibleCheckpointId: string | null;
  route: CalculatedRoute | null;
  message: string;
}
