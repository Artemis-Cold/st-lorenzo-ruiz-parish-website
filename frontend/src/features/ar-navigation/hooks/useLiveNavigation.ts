import { useEffect, useRef, useState } from "react";

import { houseNavigationMap } from "../data/houseNavigationMap";
import { findRoute, routeNodesFromIds } from "../navigation/aStar";
import { NavigationEngine } from "../navigation/navigationEngine";
import { createRouteGeometry } from "../navigation/routeGeometry";
import { SensorFusionTracker } from "../tracking/SensorFusionTracker";
import type {
  NavigationLocation,
  NavigationSnapshot,
  UserPose,
} from "../types/navigation";

const DEFAULT_ORIGIN_ID = "room-3";
const DEFAULT_DESTINATION_ID = "room-2";

function findLocation(locationId: string): NavigationLocation {
  const location = houseNavigationMap.locations.find(
    (item) => item.id === locationId,
  );

  if (!location) {
    throw new Error(`Navigation location "${locationId}" does not exist.`);
  }

  return location;
}

function createSession(originId: string, destinationId: string) {
  const origin = findLocation(originId);
  const destination = findLocation(destinationId);

  if (origin.nodeId === destination.nodeId) {
    throw new Error("Current location and destination must be different.");
  }

  const routeNodeIds = findRoute(
    houseNavigationMap.nodes,
    houseNavigationMap.edges,
    origin.nodeId,
    destination.nodeId,
  );

  if (routeNodeIds.length < 2) {
    throw new Error(
      `No walkable route connects ${origin.name} to ${destination.name}.`,
    );
  }

  const route = createRouteGeometry(
    routeNodesFromIds(houseNavigationMap.nodes, routeNodeIds),
  );
  const firstSegment = route.segments[0];
  const initialPose: UserPose = {
    ...firstSegment.from,
    heading: firstSegment.heading,
    pitch: -18,
    roll: 0,
  };
  const engine = new NavigationEngine(route);

  return {
    originId,
    origin,
    destinationId,
    destination,
    route,
    initialPose,
    calibrationTarget: firstSegment.to,
    engine,
    snapshot: engine.update(initialPose),
  };
}

export function useLiveNavigation() {
  const [session, setSession] = useState(() =>
    createSession(DEFAULT_ORIGIN_ID, DEFAULT_DESTINATION_ID),
  );
  const [snapshot, setSnapshot] = useState<NavigationSnapshot>(
    session.snapshot,
  );
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [tracker] = useState(
    () =>
      new SensorFusionTracker(session.initialPose, session.initialPose.heading),
  );
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const sessionRef = useRef(session);

  const updateFromPose = (pose: UserPose) => {
    setSnapshot(sessionRef.current.engine.update(pose));
  };

  const applySession = (nextSession: ReturnType<typeof createSession>) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
    setSnapshot(nextSession.snapshot);
    tracker.calibrate(nextSession.initialPose, nextSession.initialPose.heading);
  };

  const setOriginId = (originId: string) => {
    let destinationId = sessionRef.current.destinationId;
    const origin = findLocation(originId);

    if (findLocation(destinationId).nodeId === origin.nodeId) {
      destinationId = houseNavigationMap.locations.find(
        (location) => location.nodeId !== origin.nodeId,
      )!.id;
    }

    applySession(createSession(originId, destinationId));
  };

  const setDestinationId = (destinationId: string) => {
    if (
      findLocation(destinationId).nodeId === sessionRef.current.origin.nodeId
    ) {
      return;
    }

    applySession(createSession(sessionRef.current.originId, destinationId));
  };

  const startTracking = async () => {
    setTrackingError(null);

    try {
      unsubscribeRef.current?.();
      unsubscribeRef.current = tracker.subscribe(updateFromPose);
      await tracker.start();
      sessionRef.current.engine.reset();
      tracker.calibrate(
        sessionRef.current.initialPose,
        sessionRef.current.initialPose.heading,
      );
    } catch (error) {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      tracker.stop();
      const message =
        error instanceof Error
          ? error.message
          : "Motion and orientation tracking could not be started.";
      setTrackingError(message);
      throw error;
    }
  };

  const stopTracking = () => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    tracker.stop();
  };

  const recalibrate = () => {
    const currentSession = sessionRef.current;
    currentSession.engine.reset();
    tracker.calibrate(
      currentSession.initialPose,
      currentSession.initialPose.heading,
    );
  };

  useEffect(
    () => () => {
      unsubscribeRef.current?.();
      tracker.stop();
    },
    [tracker],
  );

  return {
    map: houseNavigationMap,
    route: session.route,
    origin: session.origin,
    originId: session.originId,
    setOriginId,
    destination: session.destination,
    destinationId: session.destinationId,
    setDestinationId,
    calibrationTarget: session.calibrationTarget,
    snapshot,
    trackingError,
    startTracking,
    stopTracking,
    recalibrate,
    trackingMode: tracker.mode,
  };
}
