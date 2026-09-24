import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ParishLogo from "@/components/common/ParishLogo";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  DoorOpen,
  MapPin,
  RotateCcw,
  Route,
  ScanLine,
  X,
} from "lucide-react";
import { activeMap } from "../maps/activeMap";
import { validateTargetFile } from "../services/targetFile";
import type { MapProfile } from "../types/checkpointNavigation";
import { useNavigation } from "../hooks/useNavigation";
import ARCamera from "../components/ARCamera";
import NavigationArrow from "../components/NavigationArrow";
import NavigationSheet from "../components/NavigationSheet";
import "../navigation.css";

type Panel = "help" | "route" | "destination" | null;

export default function ARNavigationPage() {
  return <NavigationSession key={activeMap.id} profile={activeMap} />;
}

function NavigationSession({ profile }: { profile: MapProfile }) {
  const building = profile.building;
  const indices = useMemo(
    () =>
      building.checkpoints.flatMap((point) =>
        point.targetIndex === null ? [] : [point.targetIndex],
      ),
    [building],
  );
  const floorName = (nodeId: string) =>
    building.floors?.find(
      (floor) =>
        floor.id ===
        building.graph.nodes.find((node) => node.id === nodeId)?.floorId,
    )?.name;
  const navigation = useNavigation(building);
  const markerLabels = useMemo(
    () =>
      Object.fromEntries(
        building.checkpoints.flatMap((point) =>
          point.targetIndex === null ? [] : [[point.targetIndex, point.name]],
        ),
      ),
    [building],
  );
  const { state, instruction, report, reportTarget } = navigation;
  const [active, setActive] = useState(false);
  const [targets, setTargets] = useState<ArrayBuffer | null>(null);
  const [targetError, setTargetError] = useState(!profile.markerSet);
  const [loadAttempt, setLoadAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const markerSet = profile.markerSet;
    if (!markerSet) {
      return;
    }
    void fetch(markerSet.targetsUrl, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load navigation");
        const buffer = await response.arrayBuffer();
        validateTargetFile(buffer, markerSet.markers.length);
        if (!controller.signal.aborted) {
          setTargets(buffer);
          setTargetError(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setTargetError(true);
      });
    return () => controller.abort();
  }, [profile.markerSet, loadAttempt]);
  const [attempt, setAttempt] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const checkpoint = building.checkpoints.find(
    (item) => item.id === state.currentCheckpointId,
  );
  const visible = state.visibleCheckpointId !== null;
  const destination = building.destinations.find(
    (item) => item.id === state.destinationId,
  )!;
  const reached = instruction?.direction === "destination";
  const stop = () => {
    setActive(false);
    setPanel(null);
    report({ type: "reset" });
  };
  const start = () => {
    if (!targets || !profile.markerSet) return;
    report({ type: "reset" });
    setActive(true);
    setPanel(null);
  };
  const rescan = () => {
    report({ type: "reset" });
    setAttempt((value) => value + 1);
  };
  const destinations = (
    <div
      className="nav-destinations"
      role="group"
      aria-label="Choose a destination"
    >
      {building.destinations.map((item) => (
        <button
          key={item.id}
          className="nav-place"
          aria-pressed={state.destinationId === item.id}
          onClick={() => {
            report({ type: "destination", id: item.id });
            if (active) setPanel(null);
          }}
        >
          <DoorOpen size={19} aria-hidden />
          <span>
            {item.name}
            {floorName(item.nodeId) && <small>{floorName(item.nodeId)}</small>}
          </span>
          {state.destinationId === item.id && <Check size={17} aria-hidden />}
        </button>
      ))}
    </div>
  );

  if (!active)
    return (
      <main className="nav-app nav-setup">
        <div className="nav-setup-wrap">
          <header className="nav-brand">
            <Link
              to="/dashboard"
              className="nav-icon nav-icon-light"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </Link>
            <ParishLogo className="nav-parish-logo" alt="" />
            <span className="nav-brand-name">
              St. Lorenzo Ruiz Parish <small>AR Navigation</small>
            </span>
          </header>
          <section className="nav-welcome">
            <h1>
              Where would you
              <br />
              like to go?
            </h1>
            <p>
              Choose your destination. Scan a nearby marker,
              <br className="nav-desktop-break" /> and we’ll show you the way.
            </p>
          </section>
          <section className="nav-destination-card">
            <div className="nav-section-heading">
              <h2>Choose a destination</h2>
              <span>{building.schematic ? "2 floors" : "Test layout"}</span>
            </div>
            {destinations}
            <button
              className="nav-primary"
              disabled={!targets || !profile.markerSet}
              onClick={start}
            >
              <ScanLine size={21} />
              <span>
                {!profile.markerSet
                  ? "Parish markers not yet configured"
                  : targets
                    ? "Start camera navigation"
                    : "Preparing navigation…"}
              </span>
              <ArrowUpRight size={20} />
            </button>
            {targetError && (
              <p role="alert" className="nav-permission-note">
                Couldn’t load navigation.{" "}
                <button
                  className="underline"
                  onClick={() => {
                    setTargetError(false);
                    setLoadAttempt((value) => value + 1);
                  }}
                >
                  Retry
                </button>
              </p>
            )}
            <p className="nav-permission-note">
              Guidance ends at the entrance.
            </p>
          </section>
          <footer className="nav-setup-footer">
            <MapPin size={14} /> Location is confirmed at each scanned
            checkpoint.
          </footer>
        </div>
      </main>
    );

  return (
    <main className="nav-app nav-live">
      {targets && (
        <ARCamera
          key={attempt}
          buffer={targets}
          indices={indices}
          labels={markerLabels}
          onTarget={reportTarget}
          onRetry={rescan}
          onBack={stop}
        />
      )}
      <div className="nav-camera-shade" aria-hidden />
      <header className="nav-live-header">
        <div className="nav-topbar">
          <button
            className="nav-icon"
            onClick={stop}
            aria-label="Stop navigation"
          >
            <X size={21} />
          </button>
          <button
            className="nav-destination-switch"
            onClick={() => setPanel("destination")}
            aria-label={"Change destination, currently " + destination.name}
          >
            <MapPin size={18} />
            <span>
              <small>{floorName(destination.nodeId) ?? "HEADING TO"}</small>
              <strong>{destination.name}</strong>
            </span>
            <ChevronDown size={16} />
          </button>
          <button
            className="nav-icon"
            onClick={() => setPanel("help")}
            aria-label="Navigation help"
          >
            <CircleHelp size={21} />
          </button>
        </div>
        <div className="nav-location-pill" role="status">
          <span
            className={visible ? "nav-status-dot confirmed" : "nav-status-dot"}
          />
          {checkpoint
            ? (visible ? "Confirmed: " : "Last confirmed: ") + checkpoint.name
            : "Looking for a checkpoint"}
          {checkpoint && floorName(checkpoint.nodeId) && (
            <span> · {floorName(checkpoint.nodeId)}</span>
          )}
        </div>
        {state.message === "Location updated. Route recalculated." && (
          <p className="nav-recalculated" role="status">
            {state.message}
          </p>
        )}
      </header>

      {!instruction && !checkpoint && (
        <div className="nav-scan-frame" aria-hidden>
          <ScanLine size={40} strokeWidth={1} />
          <span>Place the marker in view</span>
        </div>
      )}

      <div className="nav-bottom">
        {instruction &&
          !instruction.transition &&
          instruction.direction !== "unknown" && (
            <div className="nav-camera-direction" aria-hidden="true">
              <NavigationArrow direction={instruction.direction} />
            </div>
          )}
        <section
          className={"nav-guidance" + (reached ? " arrived" : "")}
          aria-live="polite"
          aria-atomic="true"
        >
          {instruction ? (
            <>
              <div className="nav-instruction-row">
                {instruction.transition && (
                  <div className="nav-arrow-slot">
                    <span className="nav-floor-symbol" aria-hidden>
                      ⇅
                    </span>
                  </div>
                )}
                <div className="nav-instruction-copy">
                  <span className="nav-eyebrow">
                    {reached ? "YOU’RE HERE" : "YOUR NEXT MOVE"}
                  </span>
                  <h1>{instruction.label}</h1>
                  <p>
                    {reached ? destination.name : "Toward " + instruction.next}
                  </p>
                </div>
              </div>
              {!reached && !building.schematic && (
                <div className="nav-distance-row">
                  <span>
                    <strong>≈ {instruction.distance.toFixed(1)} m</strong> this
                    leg
                  </span>
                  <span>
                    ≈ {state.route?.totalDistance.toFixed(1)} m remaining*
                  </span>
                </div>
              )}
              <p className="nav-guidance-note">
                {reached
                  ? "Your destination checkpoint is confirmed."
                  : instruction.transition
                    ? "Scan the marker at the next landing to confirm your floor."
                    : profile.id === "parish"
                      ? "Keep your scanning direction when reading the arrow."
                      : "Face toward the top of the floor plan before following the arrow."}
              </p>
              {!reached && (
                <span className="nav-distance-note">
                  {building.schematic
                    ? "Location updates when you scan a marker."
                    : "*From your last scan. Updates at checkpoints."}
                </span>
              )}
              {reached && (
                <button className="nav-finish" onClick={stop}>
                  <Check size={18} /> Finish navigation
                </button>
              )}
            </>
          ) : (
            <div className="nav-scan-copy">
              <span className="nav-eyebrow">LET’S FIND YOUR START</span>
              <h1>
                {checkpoint
                  ? "No public route available"
                  : "Scan a nearby marker"}
              </h1>
              <p>
                {checkpoint
                  ? "This connection is restricted or has not been confirmed. Choose another destination; do not enter a staff-only area."
                  : "Hold your phone steady with the whole marker in view."}
              </p>
            </div>
          )}
        </section>
        <nav className="nav-toolbar" aria-label="Navigation tools">
          <button onClick={rescan}>
            <RotateCcw size={17} />
            Rescan
          </button>
          <button onClick={() => setPanel("route")}>
            <Route size={17} />
            Route
          </button>
        </nav>
      </div>

      {panel && (
        <NavigationSheet
          title={
            {
              help: "A little help",
              route: "Your route",
              destination: "Change destination",
            }[panel]
          }
          onClose={() => setPanel(null)}
        >
          {panel === "destination" && destinations}
          {panel === "help" && (
            <div className="nav-help">
              <p>
                Hold the phone steady and fit a complete checkpoint marker in
                the camera view.
              </p>
              <h3>After a scan</h3>
              <p>
                {profile.id === "parish"
                  ? "Directions use the facing shown for each marker on your placement map. Keep that scanning direction when reading the arrow; phone rotation is not tracked."
                  : "Face toward the top of the floor plan before following the arrow."}{" "}
                Your last instruction stays visible when the marker leaves view.
              </p>
              <h3>At the next checkpoint</h3>
              <p>
                Scan again to confirm your location and update the route.
                Distance is an estimate from your last scan, not a live walking
                measurement.
              </p>
              <h3>Need a fresh start?</h3>
              <p>
                Use Rescan to clear your last location. Use the × button to stop
                navigation and close the camera.
              </p>
              <p className="nav-help-note">{profile.notice}</p>
            </div>
          )}
          {panel === "route" && (
            <div className="nav-route-panel">
              <p>
                Destination: <strong>{destination.name}</strong>
              </p>
              {state.route ? (
                <>
                  <p>
                    {building.schematic
                      ? "Route from "
                      : `≈ ${state.route.totalDistance.toFixed(1)} m from `}
                    {checkpoint?.name}
                  </p>
                  <ol>
                    {state.route.nodes.map((id, index) => (
                      <li key={id}>
                        <span>{index + 1}</span>
                        <div>
                          {
                            building.graph.nodes.find((node) => node.id === id)
                              ?.name
                          }
                          {floorName(id) && <small>{floorName(id)}</small>}
                          {index === 0 && (
                            <small>Last confirmed location</small>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p>
                  {checkpoint
                    ? "No confirmed public passage connects these locations."
                    : "Scan a checkpoint to see your route."}
                </p>
              )}
            </div>
          )}
        </NavigationSheet>
      )}
    </main>
  );
}
