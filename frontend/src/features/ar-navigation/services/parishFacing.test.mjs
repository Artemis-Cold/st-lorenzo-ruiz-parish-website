import test from "node:test";
import assert from "node:assert/strict";
import { parishBuilding as building } from "../maps/parish/config.ts";
import { parishMarkers } from "../maps/parish/markers.ts";
import {
  initialNavigation,
  transitionNavigation,
  navigationInstruction,
} from "./checkpointNavigation.ts";

test("final map has eleven destinations and six transit-only markers", () => {
  assert.deepEqual(
    building.destinations.map((d) => d.name),
    [
      "Function Hall",
      "Multipurpose Hall",
      "Parish Office",
      "Parish Store",
      "Bell Tower",
      "Comfort Room",
      "Main Church",
      "Altar",
      "Choir Stand",
      "Sacristy",
      "Candle Stand",
    ],
  );
  const arrivals = new Set(building.destinations.map((d) => d.nodeId));
  assert.deepEqual(
    parishMarkers.filter((m) => !arrivals.has(m.nodeId)).map((m) => m.nodeId),
    [
      "b_front_left",
      "b_front_right",
      "c_front_left",
      "c_front_right",
      "c_left_aisle",
      "c_right_aisle",
    ],
  );
});

test("scan-facing matches every triangle in the final user diagram", () => {
  const expected = {
    b_front_left: 0,
    b_front_right: 0,
    b_multipurpose: 0,
    b_office: 270,
    b_store: 90,
    b_function: 0,
    c_front_left: 90,
    c_front_right: 270,
    c_left_aisle: 0,
    c_right_aisle: 0,
    c_altar: 0,
    c_choir: 270,
    c_sacristy: 90,
    c_candle: 90,
    bell_entry: 90,
    comfort_entry: 90,
    c_church: 0,
  };
  for (const m of parishMarkers) {
    assert.equal(m.facing, expected[m.nodeId], m.nodeId);
    assert.equal(
      building.checkpoints.find((c) => c.nodeId === m.nodeId).facing,
      m.facing,
    );
  }
});

test("every parish marker explicitly routes from its public scan position", () => {
  const graphNodes = new Set(building.graph.nodes.map((node) => node.id));

  for (const marker of parishMarkers) {
    const checkpoint = building.checkpoints.find(
      (item) => item.nodeId === marker.nodeId,
    );
    assert.equal(checkpoint.departureNodeId, marker.departureNodeId);
    assert.ok(graphNodes.has(checkpoint.departureNodeId));

    const destination = building.destinations.find(
      (item) => item.nodeId === marker.nodeId,
    );
    if (!destination) continue;

    const arrival = transitionNavigation(
      initialNavigation(destination.id),
      { type: "found", id: marker.nodeId },
      building,
    );
    assert.equal(
      navigationInstruction(arrival, building).direction,
      "destination",
      marker.nodeId,
    );
  }
});

test("unmarked geometry cannot become a detected checkpoint", () => {
  const state = initialNavigation("altar");
  for (const id of ["b_front_hall", "outside_left", "outside_right"]) {
    assert.equal(
      transitionNavigation(state, { type: "found", id }, building),
      state,
    );
  }
});

test("directions and exact arrow angles are relative to the scan-facing", () => {
  // Isolate the bearing calculation for every heading without assuming a route
  // through a wall in the real map: an eastward test edge is a synthetic graph.
  for (const [facing, direction, relativeAngle] of [
    [0, "right", 90],
    [90, "straight", 0],
    [180, "left", -90],
    [270, "back", -180],
  ]) {
    const fixture = {
      graph: {
        nodes: [
          { id: "a", name: "A" },
          { id: "b", name: "B" },
        ],
        edges: [{ from: "a", to: "b", distance: 1 }],
      },
      destinations: [{ id: "b", name: "B", nodeId: "b" }],
      layout: { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } },
      checkpoints: [
        { id: "a", nodeId: "a", name: "A", facing, targetIndex: 0 },
      ],
    };
    const state = transitionNavigation(
      initialNavigation("b"),
      { type: "found", id: "a" },
      fixture,
    );
    const instruction = navigationInstruction(state, fixture);
    assert.equal(instruction.direction, direction);
    assert.equal(instruction.relativeAngle, relativeAngle);
  }
});
