import { useMindAR } from "../hooks/useMindAR";
import { LoaderCircle, CameraOff } from "lucide-react";
import type { MarkerGuidance } from "../services/mindarProtocol";

export default function ARCamera({
  buffer,
  onTarget,
  onRetry,
  onBack,
  indices,
  guidance,
}: {
  buffer: ArrayBuffer;
  onTarget: (index: number, visible: boolean) => void;
  onRetry: () => void;
  onBack: () => void;
  indices: number[];
  guidance: MarkerGuidance | null;
}) {
  const { container, status, error } = useMindAR(
    buffer,
    onTarget,
    indices,
    guidance,
  );
  return (
    <>
      <div ref={container} className="fixed inset-0 z-0 bg-black" />
      {!error && status === "Scanning for a checkpoint" ? (
        <span className="sr-only" role="status">
          {status}
        </span>
      ) : (
        <div className="nav-camera-loading" role={error ? "alert" : "status"}>
          <div>
            {error ? (
              <CameraOff size={36} />
            ) : (
              <LoaderCircle size={36} className="nav-spin" />
            )}
            <h2>
              {error ? "Let’s get your camera ready" : "Opening your camera"}
            </h2>
            <p>{error ?? status}</p>
            {error && (
              <button className="nav-secondary" onClick={onRetry}>
                Try again
              </button>
            )}
            <button className="nav-secondary" onClick={onBack}>
              {error ? "Back" : "Cancel"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
