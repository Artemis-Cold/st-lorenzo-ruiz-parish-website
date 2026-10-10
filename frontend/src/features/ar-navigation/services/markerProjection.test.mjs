import test from "node:test";
import assert from "node:assert/strict";
import {
  markerArrowPoints,
  pointOnMarker,
  projectMarker,
} from "./markerProjection.ts";
const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const world = [...identity];
world[12] = -1;
world[13] = -1;
test("projects marker corners clockwise with top-left image orientation", () => {
  assert.deepEqual(
    projectMarker(world, identity, [2, 2], [100, 100], [100, 100]),
    [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ],
  );
});
test("projection follows centered object-fit cover cropping in portrait and landscape", () => {
  const points = projectMarker(world, identity, [2, 2], [200, 100], [100, 200]);
  assert.deepEqual(points, [
    { x: -150, y: 0 },
    { x: 250, y: 0 },
    { x: 250, y: 200 },
    { x: -150, y: 200 },
  ]);
  assert.deepEqual(
    projectMarker(world, identity, [2, 2], [100, 200], [200, 100]),
    [
      { x: 0, y: -150 },
      { x: 200, y: -150 },
      { x: 200, y: 250 },
      { x: 0, y: 250 },
    ],
  );
});
test("rejects malformed geometry and points behind the camera", () => {
  assert.equal(
    projectMarker([], identity, [2, 2], [100, 100], [100, 100]),
    null,
  );
  assert.equal(
    projectMarker(world, identity, [], [100, 100], [100, 100]),
    null,
  );
  assert.equal(
    projectMarker(world, identity, [2, 2], [0, 100], [100, 100]),
    null,
  );
  const behind = [...world];
  behind[15] = -1;
  assert.equal(
    projectMarker(behind, identity, [2, 2], [100, 100], [100, 100]),
    null,
  );
});

test("projects navigation arrows in the marker plane at exact route angles", () => {
  const corners = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  assert.deepEqual(pointOnMarker(corners, 0, 0), { x: 50, y: 50 });

  const straight = markerArrowPoints(corners, 0);
  const right = markerArrowPoints(corners, 90);
  const left = markerArrowPoints(corners, -90);
  assert.ok(straight[4].y < straight[0].y);
  assert.ok(right[4].x > right[0].x);
  assert.ok(left[4].x < left[0].x);
  const enlarged = markerArrowPoints(corners, 0, 1.2);
  assert.ok(enlarged[4].y < straight[4].y);
  assert.equal(markerArrowPoints(corners, Number.NaN), null);
  assert.equal(markerArrowPoints(corners, 0, 0), null);
});
