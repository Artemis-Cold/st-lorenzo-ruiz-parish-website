import {
  ArrowLeft,
  Bug,
  Compass,
  CornerUpLeft,
  CornerUpRight,
  Flag,
  LocateFixed,
  TriangleAlert,
} from "lucide-react";

import type {
  NavigationLocation,
  NavigationSnapshot,
} from "../types/navigation";

interface NavigationHUDProps {
  origin: NavigationLocation;
  destination: NavigationLocation;
  snapshot: NavigationSnapshot;
  debugVisible: boolean;
  onExit: () => void;
  onRecalibrate: () => void;
  onToggleDebug: () => void;
}

export default function NavigationHUD({
  origin,
  destination,
  snapshot,
  debugVisible,
  onExit,
  onRecalibrate,
  onToggleDebug,
}: NavigationHUDProps) {
  const needsHeadingAlignment =
    !snapshot.arrived && Math.abs(snapshot.headingDifference) >= 28;
  const instructionDirection = needsHeadingAlignment
    ? snapshot.headingDifference > 0
      ? "right"
      : "left"
    : snapshot.turnDirection;
  const TurnIcon =
    instructionDirection === "left"
      ? CornerUpLeft
      : instructionDirection === "right"
        ? CornerUpRight
        : Flag;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-3 sm:p-4"
      style={{
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="pointer-events-auto flex items-start gap-2">
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit indoor navigation"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 bg-black/60 text-white shadow-lg backdrop-blur-md transition active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="min-w-0 flex-1 rounded-2xl border border-white/25 bg-black/60 px-3 py-2 shadow-lg backdrop-blur-md">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            {origin.name} to
          </span>
          <p className="mt-0.5 truncate text-sm font-bold text-white">
            {destination.name}
          </p>
        </div>

        <button
          type="button"
          onClick={onRecalibrate}
          aria-label={`Recalibrate at ${origin.name}`}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 bg-black/60 text-white shadow-lg backdrop-blur-md transition active:scale-95"
        >
          <LocateFixed size={20} />
        </button>
        <button
          type="button"
          onClick={onToggleDebug}
          aria-label="Toggle navigation debug information"
          aria-pressed={debugVisible}
          className={`grid size-11 shrink-0 place-items-center rounded-full border shadow-lg backdrop-blur-md transition active:scale-95 ${
            debugVisible
              ? "border-cyan-300 bg-cyan-400 text-cyan-950"
              : "border-white/25 bg-black/60 text-white"
          }`}
        >
          <Bug size={19} />
        </button>
      </div>

      <div className="space-y-2">
        {snapshot.offRoute && !snapshot.arrived && (
          <div className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-full border border-amber-300/60 bg-amber-500/90 px-4 py-2 text-xs font-bold text-amber-950 shadow-xl">
            <TriangleAlert size={17} /> Move back toward the highlighted route.
          </div>
        )}

        {snapshot.pose.stepTrackingPaused && !snapshot.arrived && (
          <div className="mx-auto w-fit rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white/85 backdrop-blur-md">
            Movement paused while your phone is turning
          </div>
        )}

        <div className="pointer-events-auto mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/25 bg-black/70 p-3 text-white shadow-2xl backdrop-blur-lg">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-cyan-400 text-cyan-950">
            {snapshot.arrived ? <Flag size={25} /> : <TurnIcon size={25} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold">
              {snapshot.arrived
                ? "You have arrived"
                : needsHeadingAlignment
                  ? `Turn ${instructionDirection} to face the route`
                  : snapshot.turnDirection === "arrive"
                    ? "Continue toward the destination"
                    : `Turn ${snapshot.turnDirection} ahead`}
            </p>
            <p className="mt-0.5 text-xs text-white/70">
              {snapshot.arrived
                ? destination.name
                : needsHeadingAlignment
                  ? "Align the phone with the highlighted line"
                  : `${snapshot.distanceToNextTurn.toFixed(1)} m to the next instruction`}
            </p>
          </div>
          <div className="shrink-0 text-center">
            <Compass
              size={25}
              className="mx-auto text-cyan-300 transition-transform duration-200"
              style={{ transform: `rotate(${snapshot.headingDifference}deg)` }}
            />
            <span className="mt-1 block text-[10px] text-white/60">
              {snapshot.distanceRemaining.toFixed(1)} m left
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
