import { useEffect, useRef, useState } from "react";

import { mockNavigationMap } from "../data/mockNavigationMap";
import { findRoute, routeNodesFromIds } from "../navigation/aStar";
import { NavigationEngine } from "../navigation/navigationEngine";
import {
  createRouteGeometry,
  pointAtRouteDistance,
} from "../navigation/routeGeometry";
import { IOSDevelopmentTracker } from "../tracking/IOSDevelopmentTracker";
import type { NavigationSnapshot, UserPose } from "../types/navigation";

const START_NODE_ID = 1;

function createSession(destinationId: string) {
  const destination =
    mockNavigationMap.destinations.find((item) => item.id === destinationId) ??
    mockNavigationMap.destinations[0];
  const routeNodeIds = findRoute(
    mockNavigationMap.nodes,
    mockNavigationMap.edges,
    START_NODE_ID,
    destination.nodeId,
  );
  const route = createRouteGeometry(
    routeNodesFromIds(mockNavigationMap.nodes, routeNodeIds),
  );
  const routePosition = pointAtRouteDistance(route, 0);
  const initialPose: UserPose = {
    ...routePosition.point,
    heading: routePosition.heading,
    pitch: -18,
    roll: 0,
  };
  const engine = new NavigationEngine(route);

  return {
    destinationId,
    destination,
    routeNodeIds,
    route,
    initialPose,
    engine,
    snapshot: engine.update(initialPose),
  };
}

export function useLiveNavigation() {
  const [session, setSession] = useState(() =>
    createSession(mockNavigationMap.destinations[0].id),
  );
  const [snapshot, setSnapshot] = useState<NavigationSnapshot>(
    session.snapshot,
  );
  const [tracking, setTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [tracker] = useState(
    () =>
      new IOSDevelopmentTracker(
        session.initialPose,
        session.initialPose.heading,
      ),
  );
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const sessionRef = useRef(session);

  const updateFromPose = (pose: UserPose) => {
    setSnapshot(sessionRef.current.engine.update(pose));
  };

  const setDestinationId = (destinationId: string) => {
    const nextSession = createSession(destinationId);
    sessionRef.current = nextSession;
    setSession(nextSession);
    setSnapshot(nextSession.snapshot);
    tracker.calibrate(nextSession.initialPose, nextSession.initialPose.heading);
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
      setTracking(true);
    } catch (error) {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      tracker.stop();
      const message =
        error instanceof Error
          ? error.message
          : "Device orientation and motion tracking could not be started.";
      setTrackingError(message);
      throw error;
    }
  };

  const stopTracking = () => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    tracker.stop();
    setTracking(false);
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
    map: mockNavigationMap,
    route: session.route,
    routeNodeIds: session.routeNodeIds,
    destination: session.destination,
    destinationId: session.destinationId,
    setDestinationId,
    snapshot,
    tracking,
    trackingError,
    startTracking,
    stopTracking,
    recalibrate,
    trackingMode: tracker.mode,
    calibrationAnchor: mockNavigationMap.anchors[0],
  };
}
