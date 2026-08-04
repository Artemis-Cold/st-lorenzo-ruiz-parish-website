import { useCallback, useMemo, useState } from "react";
import { waypoints, edges } from "../data/waypoints-house";
import { findRoute } from "../utils/pathfinding";
import type { RouteStep } from "../types";
import { QRScanner } from "./QRScanner";
import { DestinationSelect } from "./DestinationSelect";
import { ARNavigationView } from "./ARNavigationView";
import { MessageModal } from "./MessageModal";

type Stage = "scan-current-location" | "choose-destination" | "guiding" | "arrived" | "not-found";

// DEV-ONLY TOGGLES - flip both back before a real demo with printed QR codes.
const DEV_SKIP_SCAN_START_ID: string | null = "dining-room";
const DEV_SKIP_WAYPOINT_SCANS = true;

export function NavigationController() {
  const [stage, setStage] = useState<Stage>(
    DEV_SKIP_SCAN_START_ID ? "choose-destination" : "scan-current-location"
  );
  const [currentWaypointId, setCurrentWaypointId] = useState<string | null>(
    DEV_SKIP_SCAN_START_ID
  );
  const [route, setRoute] = useState<RouteStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [destinationId, setDestinationId] = useState<string | null>(null);

  const validWaypointIds = useMemo(() => new Set(waypoints.map((w) => w.id)), []);
  const destinationOptions = useMemo(() => waypoints.filter((w) => w.isDestinationOption), []);

  const computeRoute = useCallback((fromId: string, toId: string) => {
    const foundRoute = findRoute(fromId, toId, waypoints, edges);
    if (foundRoute.length === 0) {
      setStage("not-found");
      return;
    }
    setRoute(foundRoute);
    setStepIndex(0);
    setDestinationId(toId);
    setStage("guiding");
  }, []);

  const handleInitialScan = useCallback(
    (decodedId: string) => {
      if (!validWaypointIds.has(decodedId)) return;
      setCurrentWaypointId(decodedId);
      setStage("choose-destination");
    },
    [validWaypointIds]
  );

  const handleDestinationChosen = useCallback(
    (id: string) => {
      if (!currentWaypointId) return;
      computeRoute(currentWaypointId, id);
    },
    [currentWaypointId, computeRoute]
  );

  const advanceStep = useCallback(
    (arrivedAtId: string) => {
      const expectedNextId = route[stepIndex]?.to.id;
      if (arrivedAtId !== expectedNextId) return;

      if (stepIndex === route.length - 1) {
        setStage("arrived");
      } else {
        setStepIndex((i) => i + 1);
      }
    },
    [route, stepIndex]
  );

  const handleChangeDestinationMidRoute = useCallback(
    (newDestinationId: string) => {
      const fromId = route[stepIndex]?.from.id ?? currentWaypointId;
      if (!fromId) return;
      computeRoute(fromId, newDestinationId);
    },
    [route, stepIndex, currentWaypointId, computeRoute]
  );

  const restart = () => {
    setStage(DEV_SKIP_SCAN_START_ID ? "choose-destination" : "scan-current-location");
    setCurrentWaypointId(DEV_SKIP_SCAN_START_ID);
    setRoute([]);
    setStepIndex(0);
    setDestinationId(null);
  };

  if (stage === "scan-current-location") {
    return (
      <MessageModal icon="📍" title="Scan the QR code near you" subtitle="This tells us where you're starting from.">
        <QRScanner active onScan={handleInitialScan} />
      </MessageModal>
    );
  }

  if (stage === "choose-destination") {
    return <DestinationSelect waypoints={waypoints} onSelect={handleDestinationChosen} />;
  }

  if (stage === "guiding") {
    const currentStep = route[stepIndex];
    const destinationLabel =
      waypoints.find((w) => w.id === destinationId)?.label ?? "Choose destination";

    return (
      <div style={{ position: "relative", height: "100vh" }}>
        <ARNavigationView
          targetBearing={currentStep.bearing}
          instruction={currentStep.instruction}
          distanceMeters={currentStep.distanceMeters}
          destinationLabel={destinationLabel}
          destinations={destinationOptions}
          onChangeDestination={handleChangeDestinationMidRoute}
          onPrimaryAction={() => {
            if (DEV_SKIP_WAYPOINT_SCANS) {
              advanceStep(currentStep.to.id);
            }
          }}
          primaryActionLabel={DEV_SKIP_WAYPOINT_SCANS ? "Skip to next step" : "Scan next marker"}
        />

        {!DEV_SKIP_WAYPOINT_SCANS && (
          <div style={{ position: "absolute", bottom: 0, width: "100%", background: "white" }}>
            <QRScanner active onScan={advanceStep} />
          </div>
        )}
      </div>
    );
  }

  if (stage === "arrived") {
    return (
      <MessageModal icon="🎉" title="You've arrived" subtitle="Hope that got you where you needed to go.">
        <button className="msg-modal-button" onClick={restart}>
          Navigate somewhere else
        </button>
      </MessageModal>
    );
  }

  // stage === "not-found"
  return (
    <MessageModal
      icon="⚠️"
      title="No route found"
      subtitle="These two points aren't connected in the waypoint data yet."
    >
      <button className="msg-modal-button" onClick={restart}>
        Try again
      </button>
    </MessageModal>
  );
}
