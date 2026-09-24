import { projectMarker } from "./markerProjection.ts";

/** Lightweight pose-projected decoration; no route direction or world tracking. */
export function createMarkerOverlay(
  video: HTMLVideoElement,
  projection: number[],
  dimensions: number[][],
  labels: Record<number, string>,
) {
  const canvas = document.createElement("canvas");
  canvas.dataset.markerOverlay = "true";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const inputSize = [video.width, video.height];
  let pose: { index: number; matrix: number[] } | null = null;
  let disposed = false;
  const draw = () => {
    if (!ctx || disposed) return;
    const w = innerWidth,
      h = innerHeight,
      dpr = Math.min(devicePixelRatio || 1, 2);
    if (
      canvas.width !== Math.round(w * dpr) ||
      canvas.height !== Math.round(h * dpr)
    ) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    canvas.dataset.tracking = "false";
    // Do not show a misregistered overlay if camera input geometry changed.
    if (!pose || video.width !== inputSize[0] || video.height !== inputSize[1])
      return;
    const size = dimensions[pose.index];
    if (!size) return;
    const corners = projectMarker(pose.matrix, projection, size, inputSize, [
      w,
      h,
    ]);
    if (!corners) return;
    canvas.dataset.tracking = "true";
    canvas.dataset.targetIndex = String(pose.index);
    ctx.beginPath();
    corners.forEach((p, i) =>
      i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
    );
    ctx.closePath();
    ctx.fillStyle = "#f5d76e0c";
    ctx.fill();
    ctx.strokeStyle = "#f5d76e99";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.strokeStyle = "#f5d76e";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    corners.forEach((p, i) => {
      const before = corners[(i + 3) % 4],
        after = corners[(i + 1) % 4];
      ctx.beginPath();
      ctx.moveTo(p.x + (before.x - p.x) * 0.15, p.y + (before.y - p.y) * 0.15);
      ctx.lineTo(p.x, p.y);
      ctx.lineTo(p.x + (after.x - p.x) * 0.15, p.y + (after.y - p.y) * 0.15);
      ctx.stroke();
    });
    const label = labels[pose.index];
    if (!label) return;
    // Screen-readable label attached to the projected top edge, not a HUD panel.
    const x = (corners[0].x + corners[1].x) / 2;
    const y = (corners[0].y + corners[1].y) / 2 - 12;
    ctx.font = "600 13px system-ui, sans-serif";
    let text = label;
    while (
      text.length > 1 &&
      ctx.measureText(text).width > Math.min(w - 48, 280)
    )
      text = text.slice(0, -1);
    if (text !== label) text = text.slice(0, -1) + "…";
    const width = ctx.measureText(text).width + 24;
    // Keep the anchor honest: omit a cropped label rather than pinning it to
    // a screen edge where it would no longer follow the physical marker.
    if (y < 32 || y > h || x - width / 2 < 0 || x + width / 2 > w) return;
    ctx.fillStyle = "#292524e8";
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - 30, width, 30, 8);
    ctx.fill();
    ctx.fillStyle = "#f5d76e";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y - 15);
  };
  const observer = new ResizeObserver(draw);
  observer.observe(document.documentElement);
  video.addEventListener("resize", draw);
  return {
    update(index: number, matrix: number[] | null) {
      if (disposed) return;
      if (matrix) pose = { index, matrix };
      else if (pose?.index === index) pose = null;
      draw();
    },
    dispose() {
      disposed = true;
      pose = null;
      observer.disconnect();
      video.removeEventListener("resize", draw);
      canvas.remove();
    },
  };
}
