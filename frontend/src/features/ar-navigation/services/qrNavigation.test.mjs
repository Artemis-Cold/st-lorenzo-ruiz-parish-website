import test from "node:test";
import assert from "node:assert/strict";
import { parishBuilding } from "../maps/parish/config.ts";
import { houseBuilding } from "../maps/house/config.ts";
import {
  qrPayload,
  parseCheckpoint,
  floorRoute,
  worldRoute,
  metricPoints,
} from "./qrNavigation.ts";
const parish = { id: "parish", building: parishBuilding };
const house = { id: "house", building: houseBuilding };
const point = (id) => parishBuilding.checkpoints.find((p) => p.id === id);

test("QR payloads only resolve active checkpoints in the active map", () => {
  assert.equal(
    parseCheckpoint(qrPayload("parish", "b_front_left"), parish)?.id,
    "b_front_left",
  );
  for (const invalid of [
    qrPayload("house", "b_front_left"),
    "https://evil.test",
    "slr-nav:v2:parish:b_front_left",
    qrPayload("parish", "b_rear_left"),
    "a".repeat(201),
  ]) {
    assert.equal(parseCheckpoint(invalid, parish), null);
  }
  const housePoint = houseBuilding.checkpoints.find(
    (p) => p.targetIndex !== null,
  );
  assert.equal(
    parseCheckpoint(qrPayload("house", housePoint.id), house)?.id,
    housePoint.id,
  );
});
test("cross-floor line ends at public stairs, never altar staff stairs", () => {
  const result = floorRoute(parish, point("b_function"), "altar");
  assert.ok(result.nextFloor?.includes("2nd Floor"));
  assert.ok(["b_front_left", "b_front_right"].includes(result.nodes.at(-1)));
  assert.ok(
    result.nodes.every((id) => !id.includes("rear") && id.startsWith("b_")),
  );
  const resumed = floorRoute(parish, point("c_front_left"), "altar");
  assert.equal(resumed.nextFloor, null);
  assert.equal(resumed.nodes.at(-1), "c_altar");
});
test("unmeasured exterior routes fail closed; QR arrival still works", () => {
  assert.throws(
    () => floorRoute(parish, point("b_multipurpose"), "bell-tower"),
    /calibration/,
  );
  assert.throws(
    () => floorRoute(parish, point("comfort_entry"), "parish-office"),
    /calibration/,
  );
  assert.deepEqual(
    floorRoute(parish, point("bell_entry"), "bell-tower").nodes,
    ["bell_entry"],
  );
});
test("route scale uses plan envelope; house coordinates stay unchanged", () => {
  const [a, b] = metricPoints(parish, ["b_rear_left", "b_rear_right"]);
  assert.ok(Math.abs(b.x - a.x - 25) < 1e-8);
  assert.deepEqual(metricPoints(house, ["terrace_entry"]), [
    houseBuilding.layout.terrace_entry,
  ]);
});
test("AR route transform preserves distances and clockwise QR facing", () => {
  const origin = { x: 10, y: 0, z: 20 };
  const forward = { x: 0, z: -1 };
  const points = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
  ];
  const north = worldRoute(points, 0, origin, forward);
  assert.equal(north[1].x, 12);
  assert.equal(north[1].z, 20);
  const east = worldRoute(points, 90, origin, forward);
  assert.equal(east[1].x, 10);
  assert.equal(east[1].z, 18);
  const west = worldRoute(points, 270, origin, forward);
  assert.ok(Math.abs(west[1].z - 22) < 1e-8);
  assert.deepEqual(worldRoute(points, 0, origin, { x: 0, z: 0 }), []);
});
