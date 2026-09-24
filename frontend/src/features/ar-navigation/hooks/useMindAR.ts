import { useEffect, useRef, useState } from "react";
import { createMindARFrame } from "../services/createMindARFrame";

export function useMindAR(
  buffer: ArrayBuffer,
  onTarget: (index: number, visible: boolean) => void,
  indices: number[],
  labels: Record<number, string>,
) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onTarget);
  const [status, setStatus] = useState("Initializing AR…");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    callback.current = onTarget;
  }, [onTarget]);
  useEffect(() => {
    if (!container.current) return;
    return createMindARFrame(
      container.current,
      { type: "scan", buffer, indices, labels },
      (event) => {
        if (event.type === "status") setStatus(event.message);
        if (event.type === "running") setStatus("Scanning for a checkpoint");
        if (event.type === "error") setError(event.message);
        if (event.type === "target")
          callback.current(event.index, event.visible);
      },
    );
  }, [buffer, indices, labels]);
  return { container, status, error };
}
