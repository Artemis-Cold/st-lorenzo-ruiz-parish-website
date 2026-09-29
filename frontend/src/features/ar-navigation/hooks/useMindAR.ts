import { useEffect, useRef, useState } from "react";
import { createMindARFrame } from "../services/createMindARFrame";
import type { MarkerGuidance } from "../services/mindarProtocol";

export function useMindAR(
  buffer: ArrayBuffer,
  onTarget: (index: number, visible: boolean) => void,
  indices: number[],
  guidance: MarkerGuidance | null,
) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onTarget);
  const frame = useRef<ReturnType<typeof createMindARFrame> | null>(null);
  const latestGuidance = useRef(guidance);
  const [status, setStatus] = useState("Initializing AR…");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    callback.current = onTarget;
  }, [onTarget]);
  useEffect(() => {
    if (!container.current) return;
    frame.current = createMindARFrame(
      container.current,
      { type: "scan", buffer, indices, guidance: latestGuidance.current },
      (event) => {
        if (event.type === "status") setStatus(event.message);
        if (event.type === "running") setStatus("Scanning for a checkpoint");
        if (event.type === "error") setError(event.message);
        if (event.type === "target")
          callback.current(event.index, event.visible);
      },
    );
    return () => {
      frame.current?.dispose();
      frame.current = null;
    };
  }, [buffer, indices]);
  useEffect(() => {
    latestGuidance.current = guidance;
    frame.current?.updateGuidance(guidance);
  }, [guidance]);
  return { container, status, error };
}
