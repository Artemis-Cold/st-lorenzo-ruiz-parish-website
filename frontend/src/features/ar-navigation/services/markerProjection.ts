/** MindAR matrices are column-major; marker coordinates are in image pixels. */
export function projectMarker(
  world: readonly number[],
  projection: readonly number[],
  marker: readonly number[],
  video: readonly number[],
  viewport: readonly number[],
): { x: number; y: number }[] | null {
  if (
    world.length !== 16 ||
    projection.length !== 16 ||
    marker.length !== 2 ||
    video.length !== 2 ||
    viewport.length !== 2 ||
    ![...world, ...projection, ...marker, ...video, ...viewport].every(
      Number.isFinite,
    ) ||
    [...marker, ...video, ...viewport].some((n) => n <= 0)
  )
    return null;
  const multiply = (m: readonly number[], v: number[]) =>
    [0, 1, 2, 3].map(
      (row) =>
        m[row] * v[0] +
        m[row + 4] * v[1] +
        m[row + 8] * v[2] +
        m[row + 12] * v[3],
    );
  const scale = Math.max(viewport[0] / video[0], viewport[1] / video[1]);
  const width = video[0] * scale,
    height = video[1] * scale;
  // Clockwise from the marker's top-left; same origin used by MindAR's adapter.
  const corners = [
    [0, marker[1]],
    [marker[0], marker[1]],
    [marker[0], 0],
    [0, 0],
  ];
  const result = [];
  for (const [x, y] of corners) {
    const clip = multiply(projection, multiply(world, [x, y, 0, 1]));
    if (clip[3] <= 0 || !clip.every(Number.isFinite)) return null;
    result.push({
      x: ((clip[0] / clip[3] + 1) * width) / 2 + (viewport[0] - width) / 2,
      y: ((1 - clip[1] / clip[3]) * height) / 2 + (viewport[1] - height) / 2,
    });
  }
  return result;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface MarkerRouteGeometry {
  line: ScreenPoint[];
  arrow: ScreenPoint[];
}

/** Projects a normalized marker-plane point through an already projected quad. */
export function pointOnMarker(
  corners: readonly ScreenPoint[],
  x: number,
  y: number,
): ScreenPoint | null {
  if (
    corners.length !== 4 ||
    ![...corners.flatMap((point) => [point.x, point.y]), x, y].every(
      Number.isFinite,
    )
  )
    return null;
  const u = x + 0.5;
  const v = y + 0.5;
  const top = {
    x: corners[0].x + (corners[1].x - corners[0].x) * u,
    y: corners[0].y + (corners[1].y - corners[0].y) * u,
  };
  const bottom = {
    x: corners[3].x + (corners[2].x - corners[3].x) * u,
    y: corners[3].y + (corners[2].y - corners[3].y) * u,
  };
  return {
    x: top.x + (bottom.x - top.x) * v,
    y: top.y + (bottom.y - top.y) * v,
  };
}

/** Arrow polygon on the marker plane; positive angles rotate clockwise. */
export function markerArrowPoints(
  corners: readonly ScreenPoint[],
  relativeAngle: number,
  scale = 1,
): ScreenPoint[] | null {
  if (!Number.isFinite(relativeAngle) || !Number.isFinite(scale) || scale <= 0)
    return null;
  const radians = (relativeAngle * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const shape = [
    [-0.1, 0.35],
    [0.1, 0.35],
    [0.1, -0.08],
    [0.27, -0.08],
    [0, -0.4],
    [-0.27, -0.08],
    [-0.1, -0.08],
  ];
  const points = shape.map(([x, y]) =>
    pointOnMarker(
      corners,
      (x * cosine - y * sine) * scale,
      (x * sine + y * cosine) * scale,
    ),
  );
  return points.every((point) => point !== null)
    ? (points as ScreenPoint[])
    : null;
}

/**
 * A connected route ribbon that starts near the visitor and terminates with
 * an arrow in the exact route direction. Geometry remains attached to the
 * tracked target instead of behaving like a screen-fixed compass.
 */
export function markerRouteGeometry(
  corners: readonly ScreenPoint[],
  relativeAngle: number,
): MarkerRouteGeometry | null {
  if (!Number.isFinite(relativeAngle)) return null;
  const radians = (relativeAngle * Math.PI) / 180;
  const direction = { x: Math.sin(radians), y: -Math.cos(radians) };
  const normalizedLine = [
    { x: 0, y: 0.46 },
    { x: 0, y: 0.08 },
    { x: direction.x * 0.38, y: 0.08 + direction.y * 0.46 },
  ];
  const line = normalizedLine.map(({ x, y }) => pointOnMarker(corners, x, y));
  if (line.some((point) => point === null)) return null;

  const tip = normalizedLine.at(-1)!;
  const base = {
    x: tip.x - direction.x * 0.14,
    y: tip.y - direction.y * 0.14,
  };
  const perpendicular = { x: -direction.y * 0.1, y: direction.x * 0.1 };
  const arrow = [
    tip,
    { x: base.x + perpendicular.x, y: base.y + perpendicular.y },
    { x: base.x - perpendicular.x, y: base.y - perpendicular.y },
  ].map(({ x, y }) => pointOnMarker(corners, x, y));
  if (arrow.some((point) => point === null)) return null;

  return {
    line: line as ScreenPoint[],
    arrow: arrow as ScreenPoint[],
  };
}
