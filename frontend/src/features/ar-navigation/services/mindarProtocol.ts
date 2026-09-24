export type RuntimeRequest =
  | {
      type: "scan";
      buffer: ArrayBuffer;
      indices: number[];
      labels?: Record<number, string>;
    }
  | { type: "compile"; images: string[] };
export type RuntimeEvent =
  | { type: "ready" }
  | { type: "status"; message: string }
  | { type: "running" }
  | { type: "target"; index: number; visible: boolean }
  | { type: "compiled"; buffer: ArrayBuffer }
  | { type: "error"; message: string };
