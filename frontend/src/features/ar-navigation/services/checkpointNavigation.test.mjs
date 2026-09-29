import test from "node:test";
import assert from "node:assert/strict";
import { houseBuilding } from "../maps/house/config.ts";
import {
  initialNavigation,
  transitionNavigation,
  navigationInstruction,
} from "./checkpointNavigation.ts";
import { checkpointForTarget } from "./targetMapper.ts";
import { markerManifest } from "../maps/house/markers.ts";

const change = (state, event) =>
  transitionNavigation(state, event, houseBuilding);
test("waits for a checkpoint, retains route after loss, and ignores stale loss", () => {
  const initial = initialNavigation("room-1");
  assert.equal(initial.route, null);
  const found = change(initial, { type: "found", id: "terrace_entry" });
  const lost = change(found, { type: "lost", id: "terrace_entry" });
  assert.deepEqual(lost.route, found.route);
  assert.equal(lost.currentCheckpointId, "terrace_entry");
  assert.equal(lost.visibleCheckpointId, null);
  assert.equal(change(found, { type: "lost", id: "dining_room" }), found);
});
test("unexpected checkpoint recalculates and arrival requires destination confirmation", () => {
  const start = change(initialNavigation("room-1"), {
    type: "found",
    id: "terrace_entry",
  });
  const diverted = change(start, { type: "found", id: "dining_room" });
  assert.match(diverted.message, /recalculated/);
  assert.equal(diverted.route.nodes[0], "dining_room");
  assert.notEqual(
    navigationInstruction(diverted, houseBuilding).direction,
    "destination",
  );
  const arrived = change(diverted, { type: "found", id: "room_1_entry" });
  assert.equal(
    navigationInstruction(arrived, houseBuilding).direction,
    "destination",
  );
  assert.equal(arrived.route.totalDistance, 0);
  assert.equal(change(arrived, { type: "found", id: "room_1_entry" }), arrived);
});
test("changing destination and resetting clear stale arrival", () => {
  const arrived = change(initialNavigation("room-1"), {
    type: "found",
    id: "room_1_entry",
  });
  const changed = change(arrived, { type: "destination", id: "kitchen" });
  assert.equal(changed.route.nodes.at(-1), "kitchen_entry");
  assert.notEqual(
    navigationInstruction(changed, houseBuilding).direction,
    "destination",
  );
  assert.deepEqual(
    change(changed, { type: "reset" }),
    initialNavigation("kitchen"),
  );
});
test("target mapping rejects unknown targets and events", () => {
  assert.equal(
    checkpointForTarget(0, houseBuilding.checkpoints).id,
    "terrace_door",
  );
  assert.equal(checkpointForTarget(99, houseBuilding.checkpoints), null);
  const state = initialNavigation("room-1");
  assert.equal(change(state, { type: "found", id: "missing" }), state);
  assert.equal(change(state, { type: "destination", id: "missing" }), state);
});

test("each destination has exactly one entrance marker and scanning it confirms arrival", () => {
  assert.equal(houseBuilding.destinations.length, 10);
  assert.equal(markerManifest.length, 10);
  assert.equal(new Set(markerManifest.map((marker) => marker.nodeId)).size, 10);
  for (const destination of houseBuilding.destinations) {
    const matches = markerManifest.filter(
      (marker) => marker.nodeId === destination.nodeId,
    );
    assert.equal(matches.length, 1, destination.name);
    assert.match(matches[0].name, /entrance/);
    const state = change(initialNavigation(destination.id), {
      type: "found",
      id: destination.nodeId,
    });
    assert.equal(
      navigationInstruction(state, houseBuilding).direction,
      "destination",
    );
    assert.equal(state.route.totalDistance, 0);
  }
  for (const [index, marker] of markerManifest.entries()) {
    assert.equal(
      checkpointForTarget(index, houseBuilding.checkpoints).nodeId,
      marker.nodeId,
    );
  }
});

test("routing-only interior points are not destinations or physical markers", () => {
  for (const id of ["terrace_entry", "dining_room", "bathroom_1_entry"]) {
    assert.ok(
      !houseBuilding.destinations.some(
        (destination) => destination.nodeId === id,
      ),
    );
    assert.equal(
      houseBuilding.checkpoints.find((checkpoint) => checkpoint.id === id)
        .targetIndex,
      null,
    );
  }
});
test("scan-facing matches every triangle in the supplied house map", () => {
  const expected = {
    terrace_door: 0,
    living_room: 180,
    upper_hall: 180,
    kitchen_entry: 90,
    room_1_entry: 270,
    room_2_entry: 270,
    room_3_entry: 90,
    room_4_entry: 90,
    bathroom_1_door: 0,
    bathroom_2_entry: 270,
  };

  for (const marker of markerManifest) {
    assert.equal(marker.facing, expected[marker.nodeId], marker.nodeId);
    assert.equal(
      houseBuilding.checkpoints.find(
        (checkpoint) => checkpoint.nodeId === marker.nodeId,
      ).facing,
      marker.facing,
    );
  }
});

test("doorway scans route from the corridor side while preserving arrival", () => {
  const towardDining = change(initialNavigation("dining-room"), {
    type: "found",
    id: "room_1_entry",
  });
  const instruction = navigationInstruction(towardDining, houseBuilding);

  assert.equal(towardDining.route.nodes[0], "left_hall_room_1");
  assert.equal(instruction.direction, "right");
  assert.equal(instruction.relativeAngle, 90);

  const arrivingAtRoomOne = change(initialNavigation("room-1"), {
    type: "found",
    id: "room_1_entry",
  });
  assert.equal(arrivingAtRoomOne.route.nodes[0], "room_1_entry");
  assert.equal(
    navigationInstruction(arrivingAtRoomOne, houseBuilding).direction,
    "destination",
  );
});
