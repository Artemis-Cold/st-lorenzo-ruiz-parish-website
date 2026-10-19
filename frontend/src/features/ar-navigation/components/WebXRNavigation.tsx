import { useEffect, useRef, useState } from "react";
import { createXRRoute, type XRGuideState } from "../services/webxrRoute";

export default function WebXRNavigation({
  points,
  facing,
  location,
  destination,
  nextFloor,
  onBack,
}: {
  points: { x: number; y: number }[];
  facing: number;
  location: string;
  destination: string;
  nextFloor: string | null;
  onBack: () => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    overlay = useRef<HTMLDivElement>(null);
  const guide = useRef<Awaited<ReturnType<typeof createXRRoute>> | null>(null);
  const sessionRef = useRef<XRSession | null>(null);
  const mounted = useRef(true),
    busy = useRef(false);
  const [running, setRunning] = useState(false),
    [starting, setStarting] = useState(false);
  const [status, setStatus] = useState<XRGuideState>("initializing");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (guide.current) void guide.current.stop();
      else void sessionRef.current?.end().catch(() => {});
    };
  }, []);
  async function start() {
    if (busy.current || !navigator.xr || !host.current || !overlay.current)
      return;
    busy.current = true;
    guide.current = null;
    setStarting(true);
    setStatus("initializing");
    setError(null);
    try {
      // Must be invoked directly from the user's tap, before any awaited work.
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["local-floor", "hit-test", "dom-overlay"],
        domOverlay: { root: overlay.current },
      });
      if (!mounted.current) {
        await session.end();
        return;
      }
      sessionRef.current = session;
      setRunning(true);
      guide.current = await createXRRoute(
        session,
        host.current!,
        points,
        facing,
        (value) => {
          if (mounted.current) setStatus(value);
        },
        () => {
          sessionRef.current = null;
          if (mounted.current) {
            setRunning(false);
            setStatus("initializing");
          }
        },
      );
      if (!mounted.current) await guide.current.stop();
    } catch (failure) {
      // Covers WebGL construction failure before the renderer owns cleanup.
      await sessionRef.current?.end().catch(() => {});
      sessionRef.current = null;
      if (mounted.current) {
        setRunning(false);
        setError(
          failure instanceof DOMException && failure.name === "NotAllowedError"
            ? "AR permission was not granted. Allow access and try again."
            : "This browser could not start floor-tracked AR. Use a supported Android phone with Chrome and Google Play Services for AR.",
        );
      }
    } finally {
      busy.current = false;
      if (mounted.current) setStarting(false);
    }
  }
  return (
    <main className="nav-app xr-screen">
      <div className="xr-canvas" ref={host} />
      <div className="xr-overlay" ref={overlay}>
        <header className="xr-header">
          <strong>{destination}</strong>
          <button
            disabled={starting}
            onClick={async () => {
              await guide.current?.stop();
              onBack();
            }}
          >
            Scan QR
          </button>
        </header>
        <section className="xr-controls" aria-live="polite">
          {!running ? (
            <>
              <h1>Align your route</h1>
              <p>
                Stay at {location}, facing the QR in its marked scanning
                direction. Keep that direction when starting AR.
              </p>
              {error && <p role="alert">{error}</p>}
              <button
                className="nav-primary"
                disabled={starting}
                onClick={() => void start()}
              >
                {starting ? "Starting AR…" : "Start AR"}
              </button>
            </>
          ) : (
            <>
              <p>
                {status === "aligned"
                  ? nextFloor
                    ? `Follow the line to the stairs. Scan the landing QR on ${nextFloor} to continue.`
                    : "Follow the line. Scan the destination QR to confirm arrival."
                  : status === "tracking-lost"
                    ? "Tracking interrupted. Return to the scanned QR and realign."
                    : status === "tracking-paused"
                      ? "Hold steady—recovering tracking."
                      : status === "initializing"
                        ? "Starting motion tracking. Stay at the wall QR and gently tilt the phone toward the floor."
                        : status === "ready"
                          ? "Floor found. Face the QR’s scanning direction and align."
                          : "Wall QR scanned. Stay in place and tilt down toward the floor without turning sideways. Move the phone gently to find the surface."}
              </p>
              <button
                className="nav-primary"
                disabled={
                  status !== "ready" &&
                  status !== "aligned" &&
                  status !== "tracking-lost"
                }
                onClick={() =>
                  status === "aligned" || status === "tracking-lost"
                    ? guide.current?.reset()
                    : guide.current?.align()
                }
              >
                {status === "aligned"
                  ? "Realign at QR"
                  : status === "tracking-lost"
                    ? "I’m back at the QR"
                    : status === "tracking-paused"
                      ? "Recovering tracking…"
                      : status === "initializing"
                        ? "Starting tracking…"
                        : status === "ready"
                          ? "Align route here"
                          : "Finding floor…"}
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
