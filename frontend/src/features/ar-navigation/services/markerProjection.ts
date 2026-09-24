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
