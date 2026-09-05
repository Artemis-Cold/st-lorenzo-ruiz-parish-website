import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  CornerUpLeft,
  CornerUpRight,
  Flag,
  Route,
} from "lucide-react";

import type {
  NavigationLocation,
  NavigationSnapshot,
} from "../types/navigation";

interface NavigationDebugPanelProps {
  snapshot: NavigationSnapshot;
  origin: NavigationLocation;
  destination: NavigationLocation;
  trackingMode: string;
}

const meters = (value: number) => `${value.toFixed(2)} m`;
const degrees = (value: number) => `${Math.round(value)}°`;

export default function NavigationDebugPanel({
  snapshot,
  origin,
  destination,
  trackingMode,
}: NavigationDebugPanelProps) {
  const TurnIcon =
    snapshot.turnDirection === "left"
      ? CornerUpLeft
      : snapshot.turnDirection === "right"
        ? CornerUpRight
        : Flag;

  const values = [
    ["Tracking mode", trackingMode],
    [
      "Current segment",
      `N${snapshot.currentSegment.from.id} → N${snapshot.currentSegment.to.id}`,
    ],
    [
      "Position",
      `x=${snapshot.pose.x.toFixed(2)}, z=${snapshot.pose.z.toFixed(2)}`,
    ],
    ["Detected steps", String(snapshot.pose.detectedSteps ?? 0)],
    [
      "Motion sensor",
      snapshot.pose.motionSensorActive ? "Active" : "Waiting for data",
    ],
    [
      "Orientation sensor",
      snapshot.pose.orientationSensorActive
        ? `Active (${snapshot.pose.orientationSource ?? "unknown"})`
        : "Waiting for data",
    ],
    ["Motion signal", (snapshot.pose.motionIntensity ?? 0).toFixed(2)],
    [
      "Step tracking",
      snapshot.pose.stepTrackingPaused ? "Paused while turning" : "Ready",
    ],
    ["Heading", degrees(snapshot.pose.heading)],
    ["Desired heading", degrees(snapshot.desiredHeading)],
    ["Heading difference", degrees(snapshot.headingDifference)],
    ["Distance to next turn", meters(snapshot.distanceToNextTurn)],
    ["Distance remaining", meters(snapshot.distanceRemaining)],
    ["Off-route distance", meters(snapshot.closestPoint.distanceFromRoute)],
    ["Starting location", origin.name],
    ["Destination", destination.name],
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22222]">
            Live engine state
          </p>
          <h2 className="mt-1 font-serif text-xl font-bold text-stone-900">
            Navigation Debug
          </h2>
        </div>
        <span className="grid size-10 place-items-center rounded-full bg-red-50 text-[#B22222]">
          <Compass size={21} />
        </span>
      </header>

      <div className="space-y-4 p-5">
        <div
          className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-semibold ${
            snapshot.arrived
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : snapshot.offRoute
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-sky-200 bg-sky-50 text-sky-900"
          }`}
        >
          {snapshot.arrived ? (
            <CheckCircle2 size={19} />
          ) : snapshot.offRoute ? (
            <AlertTriangle size={19} />
          ) : (
            <Route size={19} />
          )}
          {snapshot.arrived
            ? "Destination reached"
            : snapshot.offRoute
              ? "Route deviation detected"
              : "Tracking route continuously"}
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-stone-900 p-4 text-white">
          <div>
            <p className="text-xs text-stone-400">Next instruction</p>
            <p className="mt-1 flex items-center gap-2 font-semibold capitalize">
              <TurnIcon size={18} />
              {snapshot.turnDirection === "arrive"
                ? "Continue to destination"
                : `Turn ${snapshot.turnDirection}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-400">Route progress</p>
            <p className="mt-1 text-lg font-bold">
              {Math.round(snapshot.progress * 100)}%
            </p>
          </div>
        </div>

        <dl className="divide-y divide-stone-100 text-sm">
          {values.map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-3 py-2.5"
            >
              <dt className="text-stone-500">{label}</dt>
              <dd className="break-words text-right font-medium text-stone-800">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
