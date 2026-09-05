import type { NavigationPoint, UserPose } from "../types/navigation";

export const distance3D = (a: NavigationPoint, b: NavigationPoint) =>
  Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);

export const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function normalizeHeading(heading: number) {
  return ((heading % 360) + 360) % 360;
}

export function signedHeadingDifference(from: number, to: number) {
  return ((normalizeHeading(to) - normalizeHeading(from) + 540) % 360) - 180;
}

export function headingBetween(from: NavigationPoint, to: NavigationPoint) {
  // Three.js cameras look toward -Z by default. Keep 0° on -Z and increase
  // headings clockwise: 90° = +X, 180° = +Z, 270° = -X.
  const radians = Math.atan2(to.x - from.x, from.z - to.z);
  return normalizeHeading((radians * 180) / Math.PI);
}

export function interpolatePoint(
  from: NavigationPoint,
  to: NavigationPoint,
  progress: number,
): NavigationPoint {
  const amount = clamp(progress, 0, 1);

  return {
    x: from.x + (to.x - from.x) * amount,
    y: from.y + (to.y - from.y) * amount,
    z: from.z + (to.z - from.z) * amount,
  };
}

export function poseAtPoint(point: NavigationPoint, heading: number): UserPose {
  return {
    ...point,
    heading: normalizeHeading(heading),
    timestamp: Date.now(),
  };
}
