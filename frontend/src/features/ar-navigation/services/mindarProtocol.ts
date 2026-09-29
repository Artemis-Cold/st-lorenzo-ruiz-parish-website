export interface MarkerGuidance {
  targetIndex: number;
  relativeAngle: number;
  mode: "navigate" | "destination";
}

export type RuntimeRequest = {
  type: "scan";
  buffer: ArrayBuffer;
  indices: number[];
  guidance?: MarkerGuidance | null;
};
export type RuntimeCommand =
  | RuntimeRequest
  | { type: "guidance"; guidance: MarkerGuidance | null }
  | { type: "stop" };
export type RuntimeEvent =
  | { type: "ready" }
  | { type: "status"; message: string }
  | { type: "running" }
  | { type: "target"; index: number; visible: boolean }
  | { type: "error"; message: string };
