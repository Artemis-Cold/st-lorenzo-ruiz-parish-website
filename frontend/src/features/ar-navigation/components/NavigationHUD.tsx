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
  NavigationDestination,
  NavigationSnapshot,
} from "../types/navigation";

interface NavigationHUDProps {
  destinations: NavigationDestination[];
  destinationId: string;
  snapshot: NavigationSnapshot;
  debugVisible: boolean;
  onDestinationChange: (destinationId: string) => void;
  onExit: () => void;
  onRecalibrate: () => void;
  onToggleDebug: () => void;
}

export default function NavigationHUD({
  destinations,
  destinationId,
  snapshot,
  debugVisible,
  onDestinationChange,
  onExit,
  onRecalibrate,
  onToggleDebug,
}: NavigationHUDProps) {
  const TurnIcon =
    snapshot.turnDirection === "left"
      ? CornerUpLeft
      : snapshot.turnDirection === "right"
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
          aria-label="Exit AR navigation"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 bg-black/55 text-white shadow-lg backdrop-blur-md transition active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>

        <label className="min-w-0 flex-1 rounded-2xl border border-white/25 bg-black/55 px-3 py-2 shadow-lg backdrop-blur-md">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            Navigate to
          </span>
          <select
            value={destinationId}
            onChange={(event) => onDestinationChange(event.target.value)}
            className="mt-0.5 w-full bg-transparent text-sm font-bold text-white outline-none"
          >
            {destinations.map((destination) => (
              <option
                key={destination.id}
                value={destination.id}
                className="text-stone-900"
              >
                {destination.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onRecalibrate}
          aria-label="Recalibrate at entrance"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 bg-black/55 text-white shadow-lg backdrop-blur-md transition active:scale-95"
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
              : "border-white/25 bg-black/55 text-white"
          }`}
        >
          <Bug size={19} />
        </button>
      </div>

      <div className="space-y-2">
        {snapshot.offRoute && !snapshot.arrived && (
          <div className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-full border border-amber-300/60 bg-amber-500/90 px-4 py-2 text-xs font-bold text-amber-950 shadow-xl">
            <TriangleAlert size={17} /> You are off route. Return toward the
            arrows.
          </div>
        )}

        <div className="pointer-events-auto mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/25 bg-black/65 p-3 text-white shadow-2xl backdrop-blur-lg">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-cyan-400 text-cyan-950">
            {snapshot.arrived ? <Flag size={25} /> : <TurnIcon size={25} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold">
              {snapshot.arrived
                ? "You have arrived"
                : snapshot.turnDirection === "arrive"
                  ? "Continue along the route"
                  : `Turn ${snapshot.turnDirection} ahead`}
            </p>
            <p className="mt-0.5 text-xs text-white/70">
              {snapshot.arrived
                ? "Destination reached"
                : `${snapshot.distanceToNextTurn.toFixed(1)} m to next instruction`}
            </p>
          </div>
          <div className="shrink-0 text-center">
            <Compass
              size={25}
              className="mx-auto text-cyan-300 transition-transform duration-200"
              style={{ transform: `rotate(${snapshot.headingDifference}deg)` }}
            />
            <span className="mt-1 block text-[10px] text-white/60">
              {Math.round(snapshot.distanceRemaining)} m left
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
