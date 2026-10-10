import type { MarkerGuidance } from "./mindarProtocol.ts";
import {
  markerArrowPoints,
  pointOnMarker,
  projectMarker,
} from "./markerProjection.ts";

/** Pose-projected guidance attached to the currently tracked marker. */
export function createMarkerOverlay(
  video: HTMLVideoElement,
  projection: number[],
  dimensions: number[][],
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
  let guidance: MarkerGuidance | null = null;
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
    if (!guidance || guidance.targetIndex !== pose.index) return;
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.shadowColor = "#00000099";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    if (guidance.mode === "destination") {
      const check = [
        pointOnMarker(corners, -0.28, 0),
        pointOnMarker(corners, -0.08, 0.22),
        pointOnMarker(corners, 0.32, -0.25),
      ];
      if (check.every((point) => point !== null)) {
        ctx.beginPath();
        check.forEach((point, index) =>
          index
            ? ctx.lineTo(point!.x, point!.y)
            : ctx.moveTo(point!.x, point!.y),
        );
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = Math.max(
          7,
          Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y) *
            0.08,
        );
        ctx.stroke();
      }
    } else {
      const pulse = 1.12 + Math.sin(performance.now() / 240) * 0.045;
      const arrow = markerArrowPoints(corners, guidance.relativeAngle, pulse);
      if (arrow) {
        const markerWidth = Math.hypot(
          corners[1].x - corners[0].x,
          corners[1].y - corners[0].y,
        );
        const outlineWidth = Math.max(4, markerWidth * 0.035);
        const minX = Math.min(...arrow.map((point) => point.x));
        const maxX = Math.max(...arrow.map((point) => point.x));
        const minY = Math.min(...arrow.map((point) => point.y));
        const maxY = Math.max(...arrow.map((point) => point.y));
        const fill = ctx.createLinearGradient(minX, minY, maxX, maxY);
        fill.addColorStop(0, "#67e8f9");
        fill.addColorStop(0.55, "#22d3ee");
        fill.addColorStop(1, "#0891b2");

        // A slightly offset silhouette gives the flat camera overlay depth
        // without introducing a route line that could imply live tracking.
        ctx.save();
        ctx.translate(0, Math.max(5, markerWidth * 0.035));
        ctx.beginPath();
        arrow.forEach((point, index) =>
          index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y),
        );
        ctx.closePath();
        ctx.fillStyle = "#042f49cc";
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        arrow.forEach((point, index) =>
          index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y),
        );
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.strokeStyle = "#042f49";
        ctx.lineWidth = outlineWidth;
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
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
    setGuidance(next: MarkerGuidance | null) {
      guidance = next;
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
