import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { activeMap } from "../maps/activeMap";
import { navigationSupported, scanQR } from "../services/qrScanner";
import {
  floorRoute,
  metricPoints,
  parseCheckpoint,
} from "../services/qrNavigation";
import type { Checkpoint } from "../types/checkpointNavigation";
import ParishLogo from "@/components/common/ParishLogo";
import "../navigation.css";

const WebXRNavigation = lazy(() => import("../components/WebXRNavigation"));
function QRScan({ onFound }: { onFound: (value: string) => boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!video.current) return;
    return scanQR(video.current, onFound, setError);
  }, [onFound, attempt]);
  return (
    <section className="xr-scanner">
      <video
        ref={video}
        autoPlay
        muted
        playsInline
        aria-label="QR scanning camera"
      />
      <p role="status">Scan a navigation QR at your current location.</p>
      {error && (
        <>
          <p role="alert">{error}</p>
          <button
            className="nav-primary"
            onClick={() => {
              setError(null);
              setAttempt((n) => n + 1);
            }}
          >
            Retry camera
          </button>
        </>
      )}
    </section>
  );
}

export default function QRNavigationPage() {
  const profile = activeMap;
  const [supported, setSupported] = useState<boolean | null>(null);
  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null);
  const [destinationId, setDestination] = useState("");
  const [stage, setStage] = useState<"scan" | "choose" | "xr">("scan");
  const [scanError, setScanError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void navigationSupported().then((value) => {
      if (active) setSupported(value);
    });
    return () => {
      active = false;
    };
  }, []);
  const onFound = useCallback(
    (value: string) => {
      const point = parseCheckpoint(value, profile);
      if (!point) {
        setScanError("This QR is not a checkpoint for the active map.");
        return false;
      }
      setCheckpoint(point);
      setScanError(null);
      setStage("choose");
      return true;
    },
    [profile],
  );
  const destination = profile.building.destinations.find(
    (d) => d.id === destinationId,
  );
  const route = useMemo(() => {
    if (!checkpoint || !destinationId) return null;
    try {
      return { ...floorRoute(profile, checkpoint, destinationId), error: null };
    } catch (error) {
      return {
        nodes: [],
        nextFloor: null,
        error: error instanceof Error ? error.message : "Route unavailable.",
      };
    }
  }, [profile, checkpoint, destinationId]);
  const rescan = () => {
    setCheckpoint(null);
    setStage("scan");
    setScanError(null);
  };
  if (stage === "xr" && checkpoint && destination && route && !route.error)
    return (
      <Suspense
        fallback={
          <main className="nav-app nav-setup">
            <p>Preparing AR…</p>
            <button onClick={rescan}>Back to scanning</button>
          </main>
        }
      >
        <WebXRNavigation
          points={metricPoints(profile, route.nodes)}
          facing={checkpoint.facing}
          location={checkpoint.name}
          destination={destination.name}
          nextFloor={route.nextFloor}
          onBack={rescan}
        />
      </Suspense>
    );
  return (
    <main className="nav-app nav-setup">
      <div className="nav-setup-wrap">
        <header className="nav-brand">
          <Link
            to="/dashboard"
            className="nav-icon nav-icon-light"
            aria-label="Back to dashboard"
          >
            ←
          </Link>
          <ParishLogo className="nav-parish-logo" alt="" />
          <span className="nav-brand-name">
            St. Lorenzo Ruiz Parish<small>AR Navigation</small>
          </span>
        </header>
        <section className="nav-welcome">
          <h1>
            {checkpoint
              ? "Where would you like to go?"
              : "Find your starting point"}
          </h1>
        </section>
        <section className="nav-destination-card">
          {supported === null ? (
            <p role="status">Checking device support…</p>
          ) : !supported ? (
            <div role="alert">
              <h2>AR navigation is not supported on this device</h2>
              <p>
                Use Chrome on an ARCore-supported Android phone with Google Play
                Services for AR. Open this site over HTTPS and allow camera
                access.
              </p>
            </div>
          ) : stage === "scan" ? (
            <>
              <QRScan onFound={onFound} />
              {scanError && <p role="alert">{scanError}</p>}
            </>
          ) : (
            <>
              <p className="nav-permission-note">
                Current location: {checkpoint?.name}
              </p>
              <div
                className="nav-destinations"
                role="group"
                aria-label="Choose a destination"
              >
                {profile.building.destinations.map((item) => (
                  <button
                    key={item.id}
                    className="nav-place"
                    aria-pressed={destinationId === item.id}
                    onClick={() => setDestination(item.id)}
                  >
                    <span>{item.name}</span>
                    {destinationId === item.id && <span>✓</span>}
                  </button>
                ))}
              </div>
              {route?.error && <p role="alert">{route.error}</p>}
              {route &&
                !route.error &&
                (route.nodes.length === 1 ? (
                  <p role="status">
                    {route.nextFloor
                      ? `Take the public stairs to ${route.nextFloor}, then scan the landing QR.`
                      : checkpoint?.nodeId === destination?.nodeId
                        ? "Your destination checkpoint is confirmed."
                        : "The entrance is nearby. Scan its QR to confirm arrival."}
                  </p>
                ) : (
                  <button
                    className="nav-primary"
                    onClick={() => setStage("xr")}
                  >
                    Show AR route
                  </button>
                ))}
              <button className="nav-secondary" onClick={rescan}>
                Scan another QR
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
