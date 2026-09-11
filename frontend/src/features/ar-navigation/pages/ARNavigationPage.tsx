import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  LoaderCircle,
  MapPinned,
  Navigation,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import CameraView from "../components/CameraView";
import LocationSelector from "../components/LocationSelector";
import MiniMap from "../components/MiniMap";
import NavigationDebugPanel from "../components/NavigationDebugPanel";
import NavigationHUD from "../components/NavigationHUD";
import RouteLineOverlay from "../components/RouteLineOverlay";
import { useCameraStream } from "../hooks/useCameraStream";
import { useLiveNavigation } from "../hooks/useLiveNavigation";

export default function ARNavigationPage() {
  const navigate = useNavigate();
  const navigation = useLiveNavigation();
  const camera = useCameraStream();
  const [starting, setStarting] = useState(false);
  const [active, setActive] = useState(false);
  const [debugVisible, setDebugVisible] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const destinationOptions = navigation.map.locations.filter(
    (location) => location.nodeId !== navigation.origin.nodeId,
  );

  const startNavigation = async () => {
    setStarting(true);
    setStartError(null);

    try {
      await Promise.all([camera.start(), navigation.startTracking()]);
      setActive(true);
    } catch (error) {
      camera.stop();
      navigation.stopTracking();
      setStartError(
        error instanceof Error
          ? error.message
          : "Camera navigation could not be started.",
      );
    } finally {
      setStarting(false);
    }
  };

  const exitNavigation = () => {
    camera.stop();
    navigation.stopTracking();
    setActive(false);
    navigate("/dashboard");
  };

  const recalibrate = () => {
    navigation.recalibrate();
    toast.success(`Route realigned at ${navigation.origin.name}.`);
  };

  if (active) {
    return (
      <main className="fixed inset-0 z-50 overflow-hidden bg-stone-950">
        {camera.stream ? (
          <CameraView stream={camera.stream} />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white">
            <LoaderCircle className="animate-spin" size={28} />
          </div>
        )}

        <RouteLineOverlay
          route={navigation.route}
          snapshot={navigation.snapshot}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-36 bg-linear-to-b from-black/65 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-56 bg-linear-to-t from-black/70 to-transparent" />

        <div className="absolute bottom-28 left-3 z-20 w-32 sm:bottom-32 sm:left-4 sm:w-40">
          <MiniMap
            compact
            map={navigation.map}
            route={navigation.route}
            snapshot={navigation.snapshot}
          />
        </div>

        {debugVisible && (
          <div className="absolute right-3 top-20 z-40 max-h-[62vh] w-[min(22rem,calc(100%-1.5rem))] overflow-y-auto rounded-2xl sm:right-4">
            <NavigationDebugPanel
              snapshot={navigation.snapshot}
              origin={navigation.origin}
              destination={navigation.destination}
              trackingMode={navigation.trackingMode}
            />
          </div>
        )}

        <NavigationHUD
          origin={navigation.origin}
          destination={navigation.destination}
          snapshot={navigation.snapshot}
          debugVisible={debugVisible}
          onExit={exitNavigation}
          onRecalibrate={recalibrate}
          onToggleDebug={() => setDebugVisible((visible) => !visible)}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-5 text-stone-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/dashboard"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-[#B22222]"
        >
          <ArrowLeft size={18} /> Back to dashboard
        </Link>

        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl shadow-stone-200/60">
          <header className="relative overflow-hidden bg-[#8F1D1D] px-6 py-7 text-white sm:px-8 sm:py-9">
            <div className="absolute -right-12 -top-16 size-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-24 right-24 size-52 rounded-full bg-amber-300/10" />
            <div className="relative flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <MapPinned size={25} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-100">
                  Accessible indoor guidance
                </p>
                <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                  AR Navigation
                </h1>
              </div>
            </div>
          </header>

          <div className="grid gap-7 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <LocationSelector
                  type="origin"
                  label="Current location"
                  hint="Stand at the doorway or marked point you select."
                  locations={navigation.map.locations}
                  value={navigation.originId}
                  disabled={starting}
                  onChange={navigation.setOriginId}
                />
                <LocationSelector
                  type="destination"
                  label="Destination"
                  hint="The shortest connected walking route is calculated locally."
                  locations={destinationOptions}
                  value={navigation.destinationId}
                  disabled={starting}
                  onChange={navigation.setDestinationId}
                />
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Navigation
                    className="mt-0.5 shrink-0 text-cyan-700"
                    size={21}
                  />
                  <div>
                    <p className="text-sm font-bold text-cyan-950">
                      Calibrate before walking
                    </p>
                    <p className="mt-1 text-sm leading-6 text-cyan-900/80">
                      Stand at <strong>{navigation.origin.name}</strong> and
                      point the phone toward{" "}
                      <strong>{navigation.calibrationTarget.name}</strong>. Keep
                      the phone steady, then start navigation.
                    </p>
                  </div>
                </div>
              </div>

              

              {(startError || camera.error || navigation.trackingError) && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                  {startError ?? camera.error ?? navigation.trackingError}
                </div>
              )}

              <button
                type="button"
                onClick={startNavigation}
                disabled={starting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B22222] px-5 py-3.5 font-semibold text-white shadow-lg shadow-red-900/15 transition hover:bg-[#981B1B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {starting ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : (
                  <Camera size={20} />
                )}
                {starting
                  ? "Requesting permissions..."
                  : "Start camera navigation"}
              </button>

              <p className="text-center text-xs leading-5 text-stone-500">
                Use HTTPS on a phone and allow camera, orientation, and motion
                permissions. No Next button is used during navigation.
              </p>
            </div>

            <aside className="space-y-3">
              <div className="rounded-3xl bg-stone-950 p-3">
                <MiniMap
                  map={navigation.map}
                  route={navigation.route}
                  snapshot={navigation.snapshot}
                />
              </div>
              <div className="rounded-2xl border border-stone-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Estimated route
                  </span>
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-[#B22222]">
                    {navigation.route.totalDistance.toFixed(1)} m
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold text-stone-900">
                  {navigation.origin.name} → {navigation.destination.name}
                </p>
                <p className="mt-2 text-xs leading-5 text-stone-500">
                  Doorway positions are based on the supplied house plan and can
                  be refined after measuring the actual walking centreline.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
