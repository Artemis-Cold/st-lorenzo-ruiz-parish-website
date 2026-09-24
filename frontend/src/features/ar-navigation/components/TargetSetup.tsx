import { useEffect, useRef, useState } from "react";
import type { MarkerSet } from "../types/checkpointNavigation";
import { createMindARFrame } from "../services/createMindARFrame";
import { validateTargetFile } from "../services/targetFile";

export default function TargetSetup({
  onReady,
  initialBuffer,
  markerSet,
}: {
  onReady: (buffer: ArrayBuffer) => void;
  initialBuffer: ArrayBuffer | null;
  markerSet: MarkerSet;
}) {
  const testMarkers = markerSet.markers;
  const previousBuffer = useRef(initialBuffer);
  const host = useRef<HTMLDivElement>(null);
  const dispose = useRef<(() => void) | null>(null);
  const download = useRef<string | null>(null);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(true);
  const [status, setStatus] = useState("Loading the bundled test targets…");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      if (previousBuffer.current) return previousBuffer.current;
      const response = await fetch(markerSet.targetsUrl, {
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error(
          "Could not load bundled targets. Prepare test markers or choose a .mind file.",
        );
      return response.arrayBuffer();
    };
    void load()
      .then((buffer) => {
        if (controller.signal.aborted) return;
        validateTargetFile(buffer, testMarkers.length);
        onReady(buffer);
        download.current = URL.createObjectURL(
          new Blob([buffer], { type: "application/octet-stream" }),
        );
        setDownloadUrl(download.current);
        setStatus(
          previousBuffer.current
            ? "Your selected targets are still ready."
            : `${testMarkers.length} markers ready. Open or print the images below, then start the camera.`,
        );
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setStatus(
            error instanceof Error ? error.message : "Target loading failed.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [onReady, markerSet, testMarkers.length]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      dispose.current?.();
      if (download.current) URL.revokeObjectURL(download.current);
    };
  }, []);
  const accept = (buffer: ArrayBuffer) => {
    validateTargetFile(buffer, testMarkers.length);
    onReady(buffer);
    if (download.current) URL.revokeObjectURL(download.current);
    download.current = URL.createObjectURL(
      new Blob([buffer], { type: "application/octet-stream" }),
    );
    setDownloadUrl(download.current);
    setStatus(
      `${testMarkers.length} targets ready. Save the target file to reuse it next time.`,
    );
  };
  const compile = () => {
    if (!host.current || busy) return;
    setBusy(true);
    setStatus("Loading target compiler… This may take a few minutes.");
    dispose.current = createMindARFrame(
      host.current,
      {
        type: "compile",
        images: testMarkers.map(
          (marker) => new URL(marker.url, location.href).href,
        ),
      },
      (event) => {
        if (event.type === "status") setStatus(event.message);
        if (event.type === "error") {
          setStatus(event.message);
          setBusy(false);
        }
        if (event.type === "compiled") {
          try {
            accept(event.buffer);
          } catch (error) {
            setStatus((error as Error).message);
          }
          setBusy(false);
        }
      },
    );
  };
  return (
    <section className="space-y-3 rounded-xl bg-stone-50 p-3 text-sm">
      <h2 className="font-bold">Checkpoint markers</h2>
      <a
        className="inline-block min-h-11 underline"
        href={markerSet.printUrl}
        target="_blank"
        rel="noreferrer"
      >
        Print all entrance & hallway markers
      </a>
      <p>
        Open each image on another screen or print it. Keep this exact target
        order for custom files:
      </p>
      <ol className="list-inside list-decimal space-y-2" start={0}>
        {testMarkers.map((marker) => (
          <li key={marker.name}>
            <a
              className="underline"
              href={marker.url}
              target="_blank"
              rel="noreferrer"
            >
              {marker.name} — open printable marker
            </a>
            <p className="text-xs text-stone-600">{marker.placement}</p>
          </li>
        ))}
      </ol>
      <button
        disabled={busy}
        className="min-h-11 rounded-lg border px-3 disabled:opacity-50"
        onClick={compile}
      >
        Prepare test markers
      </button>
      {busy && (
        <button
          className="ml-2 min-h-11 rounded-lg border px-3"
          onClick={() => {
            dispose.current?.();
            setBusy(false);
            setStatus("Compilation cancelled.");
          }}
        >
          Cancel
        </button>
      )}
      <label className="block">
        Or load targets.mind
        <input
          className="mt-2 block max-w-full"
          type="file"
          accept=".mind"
          disabled={busy}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try {
              if (file.size > 30 * 1024 * 1024)
                throw new Error("Choose a .mind file smaller than 30 MB.");
              const buffer = await file.arrayBuffer();
              if (mounted.current) accept(buffer);
            } catch (error) {
              if (mounted.current) setStatus((error as Error).message);
            } finally {
              if (mounted.current) setBusy(false);
            }
          }}
        />
      </label>
      <p role="status">{status}</p>
      {downloadUrl && (
        <a
          href={downloadUrl}
          download="targets.mind"
          className="inline-block min-h-11 underline"
        >
          Save targets.mind
        </a>
      )}
      <div
        ref={host}
        className="fixed -left-[10000px] top-0 h-1 w-1 overflow-hidden"
        aria-hidden
      />
    </section>
  );
}
