import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  MapPinned,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import ARScene from "../components/ARScene";
import CameraView from "../components/CameraView";
import DestinationSelector from "../components/DestinationSelector";
import MiniMap from "../components/MiniMap";
import NavigationDebugPanel from "../components/NavigationDebugPanel";
import NavigationHUD from "../components/NavigationHUD";
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

  const startAR = async () => {
    setStarting(true);
    setStartError(null);

    try {
      const [cameraResult, trackingResult] = await Promise.allSettled([
        camera.start(),
        navigation.startTracking(),
      ]);

      if (cameraResult.status === "rejected") throw cameraResult.reason;
      if (trackingResult.status === "rejected") throw trackingResult.reason;

      setActive(true);
    } catch (error) {
      camera.stop();
      navigation.stopTracking();
      setStartError(
        error instanceof Error
          ? error.message
          : "AR navigation could not be started.",
      );
    } finally {
      setStarting(false);
    }
  };

  const exitAR = () => {
    camera.stop();
    navigation.stopTracking();
    setActive(false);
    navigate("/dashboard");
  };

  const recalibrate = () => {
    navigation.recalibrate();
    toast.success("Position recalibrated at the main entrance.");
  };

  if (active && camera.stream) {
    return (
      <main className="fixed inset-0 overflow-hidden bg-black">
        <CameraView stream={camera.stream} />
        <ARScene route={navigation.route} snapshot={navigation.snapshot} />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 bg-linear-to-b from-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-48 bg-linear-to-t from-black/55 to-transparent" />

        <div className="absolute bottom-28 left-3 z-20 w-36 sm:bottom-32 sm:left-4 sm:w-44">
          <MiniMap
            map={navigation.map}
            route={navigation.route}
            snapshot={navigation.snapshot}
          />
        </div>

        {debugVisible && (
          <div className="absolute right-3 top-20 z-40 max-h-[62vh] w-[min(22rem,calc(100%-1.5rem))] overflow-y-auto rounded-2xl sm:right-4">
            <NavigationDebugPanel
              snapshot={navigation.snapshot}
              destination={navigation.destination}
              trackingMode={navigation.trackingMode}
              calibrationAnchor={navigation.calibrationAnchor}
            />
          </div>
        )}

        <NavigationHUD
          destinations={navigation.map.destinations}
          destinationId={navigation.destinationId}
          snapshot={navigation.snapshot}
          debugVisible={debugVisible}
          onDestinationChange={navigation.setDestinationId}
          onExit={exitAR}
          onRecalibrate={recalibrate}
          onToggleDebug={() => setDebugVisible((visible) => !visible)}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-5 text-stone-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/dashboard"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-[#B22222]"
        >
          <ArrowLeft size={18} /> Back to dashboard
        </Link>

        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl shadow-stone-200/60">
          <header className="bg-[#B22222] px-6 py-7 text-white sm:px-8 sm:py-8">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <MapPinned size={25} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-100">
                  Camera navigation
                </p>
                <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                  Indoor AR Navigation
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-red-50/85">
                  Follow floor arrows through your camera. Turns and route
                  progress update automatically as your phone rotates and you
                  walk.
                </p>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-6 sm:p-8">
            <DestinationSelector
              destinations={navigation.map.destinations}
              value={navigation.destinationId}
              disabled={starting}
              onChange={navigation.setDestinationId}
            />

            <div className="flex items-start gap-3 rounded-xl bg-stone-50 p-4 text-sm leading-6 text-stone-600">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              <p>
                Camera and motion data remain on this device. No images or
                sensor data are sent to the server.
              </p>
            </div>

            {(startError || camera.error || navigation.trackingError) && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {startError ?? camera.error ?? navigation.trackingError}
              </div>
            )}

            <button
              type="button"
              onClick={startAR}
              disabled={starting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B22222] px-5 py-3.5 font-semibold text-white transition hover:bg-[#981B1B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {starting ? (
                <LoaderCircle size={20} className="animate-spin" />
              ) : (
                <CheckCircle2 size={20} />
              )}
              {starting
                ? "Starting Camera and Sensors..."
                : "Start AR Navigation"}
            </button>

            <p className="text-center text-xs leading-5 text-stone-500">
              Starting requires camera, orientation, and motion permission. No
              interaction is required to advance through route turns.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
