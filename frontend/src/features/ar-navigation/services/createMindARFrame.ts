import runtimeUrl from "./mindarRuntime.ts?worker&url";
import type { RuntimeRequest, RuntimeEvent } from "./mindarProtocol";

/** Each session gets a separate document so SDK workers/WebGL resources cannot
 * accumulate across React StrictMode mounts, retries, or route changes. */
export function createMindARFrame(
  container: HTMLElement,
  request: RuntimeRequest,
  onEvent: (event: RuntimeEvent) => void,
) {
  const frame = document.createElement("iframe");
  frame.title =
    request.type === "scan"
      ? "Rear camera for checkpoint recognition"
      : "MindAR target compiler";
  frame.allow = "camera";
  frame.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;border:0";
  const script = new URL(runtimeUrl, location.href).href;
  frame.srcdoc = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#000}</style></head><body><script type="module" src="${script}"></script></body></html>`;
  let disposed = false;
  const timeout = window.setTimeout(
    () => {
      onEvent({
        type: "error",
        message:
          request.type === "scan"
            ? "Camera startup timed out. Check permissions and try again."
            : "Compilation timed out. Try preparing markers on a desktop browser.",
      });
      dispose();
    },
    request.type === "scan" ? 60000 : 300000,
  );
  const receive = (event: MessageEvent<RuntimeEvent>) => {
    if (
      disposed ||
      event.source !== frame.contentWindow ||
      event.origin !== location.origin
    )
      return;
    if (event.data.type === "ready")
      frame.contentWindow?.postMessage(request, location.origin);
    if (
      event.data.type === "running" ||
      event.data.type === "compiled" ||
      event.data.type === "error"
    )
      window.clearTimeout(timeout);
    onEvent(event.data);
    if (event.data.type === "error" || event.data.type === "compiled")
      dispose();
  };
  function dispose() {
    if (disposed) return;
    disposed = true;
    window.clearTimeout(timeout);
    window.removeEventListener("message", receive);
    frame.contentWindow?.postMessage({ type: "stop" }, location.origin);
    // Same-origin access releases the camera immediately, even during startup.
    frame.contentDocument?.querySelectorAll("video").forEach((video) => {
      (video.srcObject as MediaStream | null)
        ?.getTracks()
        .forEach((track) => track.stop());
    });
    frame.remove();
  }
  window.addEventListener("message", receive);
  container.appendChild(frame);
  return dispose;
}
