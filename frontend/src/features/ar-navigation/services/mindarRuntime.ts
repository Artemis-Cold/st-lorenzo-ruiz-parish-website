// Runs in its own iframe document, not a Worker. Vite's worker URL bundler emits
// the standalone script. Removing the frame also releases MindAR's TF/WebGL realm.
import { Controller, Compiler } from "mind-ar/dist/mindar-image.prod.js";
import type { RuntimeRequest, RuntimeEvent } from "./mindarProtocol";
import { createMarkerOverlay } from "./markerOverlay";

let stopped = false;
let started = false;
let stream: MediaStream | null = null;
let controller: Controller | null = null;
let overlay: ReturnType<typeof createMarkerOverlay> | null = null;
const hostOrigin = parent.location.origin;
const visible = new Set<number>();
const send = (event: RuntimeEvent) => {
  if (!stopped) parent.postMessage(event, hostOrigin);
};
function stop() {
  if (stopped) return;
  stopped = true;
  overlay?.dispose();
  overlay = null;
  controller?.stopProcessVideo();
  stream?.getTracks().forEach((track) => track.stop());
  controller?.dispose();
  controller?.worker.terminate();
}
window.addEventListener("pagehide", stop);
window.addEventListener("error", (event) => {
  send({
    type: "error",
    message: event.message || "AR initialization failed.",
  });
  stop();
});
window.addEventListener("unhandledrejection", () => {
  send({
    type: "error",
    message: "AR processing failed. Try again or recompile your targets.",
  });
  stop();
});

async function run(request: RuntimeRequest) {
  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
  if (!gl)
    throw new Error(
      "This browser cannot run image tracking because WebGL is unavailable. Try a supported browser with hardware acceleration enabled.",
    );
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  if (request.type === "compile") {
    send({ type: "status", message: "Preparing test markers…" });
    const images = await Promise.all(
      request.images.map(async (url) => {
        const image = new Image();
        image.src = url;
        await image.decode();
        return image;
      }),
    );
    const compiler = new Compiler();
    let lastPercent = -1;
    await compiler.compileImageTargets(images, (value) => {
      const percent = Math.floor(value);
      if (percent !== lastPercent)
        send({
          type: "status",
          message: "Compiling markers: " + percent + "%",
        });
      lastPercent = percent;
    });
    const data = compiler.exportData();
    const buffer = new Uint8Array(data).buffer;
    send({ type: "compiled", buffer });
    return;
  }
  if (!isSecureContext || !navigator.mediaDevices?.getUserMedia)
    throw new Error(
      "Camera unavailable. Open this site using HTTPS in a supported mobile browser.",
    );
  send({
    type: "status",
    message: "Camera permission required. Allow access to continue.",
  });
  const acquired = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  });
  if (stopped) {
    acquired.getTracks().forEach((track) => track.stop());
    return;
  }
  stream = acquired;
  const video = document.createElement("video");
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.style.cssText =
    "width:100%;height:100%;object-fit:cover;position:absolute;inset:0";
  document.body.appendChild(video);
  video.srcObject = stream;
  await video.play();
  if (!video.videoWidth)
    await new Promise<void>((resolve) =>
      video.addEventListener("loadedmetadata", () => resolve(), { once: true }),
    );
  if (stopped) return;
  // MindAR's input loader reads width/height attributes, not videoWidth alone.
  const syncVideoSize = () => {
    video.width = video.videoWidth;
    video.height = video.videoHeight;
  };
  syncVideoSize();
  video.addEventListener("resize", syncVideoSize);
  send({ type: "status", message: "Initializing image recognition…" });
  controller = new Controller({
    inputWidth: video.videoWidth,
    inputHeight: video.videoHeight,
    maxTrack: 1,
    onUpdate: (event) => {
      if (
        event.type !== "updateMatrix" ||
        !request.indices.includes(event.targetIndex)
      )
        return;
      const found = event.worldMatrix !== null;
      // Pose decoration updates every tracking frame, not just found/lost events.
      // A decoration failure must not interrupt checkpoint recognition.
      try {
        overlay?.update(event.targetIndex, event.worldMatrix);
      } catch {
        overlay?.dispose();
        overlay = null;
      }
      if (found === visible.has(event.targetIndex)) return;
      if (found) visible.add(event.targetIndex);
      else visible.delete(event.targetIndex);
      send({ type: "target", index: event.targetIndex, visible: found });
    },
  });
  const { dimensions } = controller.addImageTargetsFromBuffer(request.buffer);
  try {
    overlay = createMarkerOverlay(
      video,
      controller.getProjectionMatrix(),
      dimensions,
      request.labels ?? {},
    );
  } catch {
    overlay = null;
  }
  await controller.dummyRun(video);
  if (stopped) return;
  send({ type: "running" });
  void controller.processVideo(video);
}
window.addEventListener(
  "message",
  (event: MessageEvent<RuntimeRequest | { type: "stop" }>) => {
    if (event.source !== parent || event.origin !== hostOrigin) return;
    if (event.data.type === "stop") {
      stop();
      return;
    }
    if (started) return;
    started = true;
    void run(event.data).catch((error: unknown) => {
      const denied =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError");
      send({
        type: "error",
        message: denied
          ? "Camera access is required for AR navigation. Allow camera access in your browser settings, then try again."
          : error instanceof Error
            ? error.message
            : "AR could not start. Please try again.",
      });
      stop();
    });
  },
);
send({ type: "ready" });
