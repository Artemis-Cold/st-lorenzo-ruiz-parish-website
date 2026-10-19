export interface FloorPoint {
  x: number;
  y: number;
  z: number;
}

export function missingPoseState(aligned: boolean, elapsedMs: number) {
  if (!aligned) return "initializing";
  return elapsedMs < 1200 ? "tracking-paused" : "tracking-lost";
}
export interface FloorSample {
  point: FloorPoint;
  camera: FloorPoint;
  time: number;
}

// Briefly retain a measured surface while the user raises the phone to align.
// Never substitute an assumed floor height when no hit has been measured.
export function usableFloor(
  sample: FloorSample | null,
  camera: FloorPoint,
  now: number,
) {
  return (
    sample !== null &&
    now - sample.time <= 2000 &&
    now >= sample.time &&
    Math.hypot(camera.x - sample.camera.x, camera.z - sample.camera.z) <= 0.75
  );
}

export function selectFloor(
  hits: { point: FloorPoint; normalY: number }[],
  camera: FloorPoint,
) {
  return (
    hits
      .filter(
        (hit) =>
          Number.isFinite(hit.normalY) &&
          hit.normalY > 0.9 &&
          [hit.point.x, hit.point.y, hit.point.z].every(Number.isFinite) &&
          hit.point.y < camera.y - 0.5 &&
          Math.hypot(hit.point.x - camera.x, hit.point.z - camera.z) < 4,
      )
      .sort((a, b) => a.point.y - b.point.y)[0]?.point ?? null
  );
}
