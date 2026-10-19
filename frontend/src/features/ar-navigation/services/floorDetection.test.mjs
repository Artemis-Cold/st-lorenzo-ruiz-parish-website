import test from "node:test";
import assert from "node:assert/strict";
import {
  selectFloor,
  usableFloor,
  missingPoseState,
} from "./floorDetection.ts";

test("startup is not interrupted tracking and short aligned gaps can recover", () => {
  assert.equal(missingPoseState(false, 0), "initializing");
  assert.equal(missingPoseState(false, 10000), "initializing");
  assert.equal(missingPoseState(true, 100), "tracking-paused");
  assert.equal(missingPoseState(true, 1200), "tracking-lost");
});
const camera = { x: 0, y: 1.6, z: 0 };
test("selects the lower horizontal surface, rejects walls and distant hits", () => {
  const floor = { x: 0, y: 0, z: -2 };
  assert.deepEqual(
    selectFloor(
      [
        { point: { x: 0, y: 0.8, z: -1 }, normalY: 1 },
        { point: floor, normalY: 1 },
        { point: { x: 0, y: -1, z: -1 }, normalY: 0 },
        { point: { x: 0, y: -1, z: -8 }, normalY: 1 },
      ],
      camera,
    ),
    floor,
  );
  assert.equal(
    selectFloor([{ point: { x: 0, y: 1.4, z: -1 }, normalY: 1 }], camera),
    null,
  );
  assert.equal(selectFloor([], camera), null);
});
test("measured floor briefly survives missing hits but expires or clears on movement", () => {
  const sample = { point: { x: 0, y: 0, z: -2 }, camera, time: 1000 };
  assert.equal(usableFloor(sample, camera, 2500), true);
  assert.equal(usableFloor(sample, camera, 3001), false);
  assert.equal(usableFloor(sample, { ...camera, x: 1 }, 1500), false);
  assert.equal(usableFloor(null, camera, 1500), false);
});
