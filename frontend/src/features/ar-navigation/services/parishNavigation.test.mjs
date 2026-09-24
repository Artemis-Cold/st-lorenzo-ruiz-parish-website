import test from "node:test";
import assert from "node:assert/strict";
import { parishBuilding } from "../maps/parish/config.ts";
import { houseBuilding } from "../maps/house/config.ts";
import { calculateRoute } from "./routeEngine.ts";
import {
  initialNavigation,
  transitionNavigation,
  navigationInstruction,
} from "./checkpointNavigation.ts";

const building = parishBuilding;
const graph = building.graph;
const route = (a, b) => calculateRoute(a, b, graph);
const change = (state, event) => transitionNavigation(state, event, building);

test("parish metadata distinguishes the two floors and outside ground level", () => {
  assert.equal(building.floors.length, 3);
  assert.equal(building.floors.find((f) => f.id === "basement").level, 1);
  assert.equal(building.floors.find((f) => f.id === "church").level, 2);
  assert.equal(building.schematic, true);
  for (const node of graph.nodes) {
    assert.ok(building.layout[node.id]);
    assert.ok(building.floors.some((f) => f.id === node.floorId));
  }
  for (const edge of graph.edges) {
    const from = graph.nodes.find((n) => n.id === edge.from);
    const to = graph.nodes.find((n) => n.id === edge.to);
    if (from.floorId !== to.floorId)
      assert.ok(["stairs", "ramp"].includes(edge.kind));
  }
});

test("public cross-floor routes use front stairs in either direction", () => {
  for (const side of ["left", "right"]) {
    const a = `b_front_${side}`,
      b = `c_front_${side}`;
    assert.deepEqual(route(a, b).nodes, [a, b]);
    assert.deepEqual(route(b, a).nodes, [b, a]);
  }
  for (const [a, b] of [
    ["b_function", "c_sacristy"],
    ["c_choir", "b_function"],
  ]) {
    const nodes = route(a, b).nodes;
    assert.ok(nodes.some((n) => n.startsWith("b_front_")));
    assert.ok(nodes.some((n) => n.startsWith("c_front_")));
    assert.ok(nodes.every((n) => !n.includes("rear_")));
  }
});

test("staff shortcut is cheaper but is filtered before public path selection", () => {
  const publicRoute = route("b_function", "c_sacristy");
  const unrestricted = {
    ...graph,
    edges: graph.edges.map((e) => ({ ...e, access: "public" })),
  };
  const shortcut = calculateRoute("b_function", "c_sacristy", unrestricted);
  assert.ok(shortcut.totalDistance < publicRoute.totalDistance);
  assert.ok(shortcut.nodes.includes("c_rear_right"));
  assert.ok(!publicRoute.nodes.includes("c_rear_right"));
});

test("no public route ever uses a restricted edge, in either direction", () => {
  for (const a of graph.nodes)
    for (const b of graph.nodes) {
      const result = route(a.id, b.id);
      if (!result) continue;
      for (let i = 1; i < result.nodes.length; i++) {
        const [from, to] = result.nodes.slice(i - 1, i + 1);
        assert.ok(
          graph.edges.some(
            (e) =>
              e.access !== "staff" &&
              e.available !== false &&
              ((e.from === from && e.to === to) ||
                (e.bidirectional !== false && e.to === from && e.from === to)),
          ),
        );
      }
    }
});

test("closing both front stairs cannot redirect visitors to altar stairs", () => {
  const closed = {
    ...graph,
    edges: graph.edges.map((e) =>
      e.kind === "stairs" && e.access !== "staff"
        ? { ...e, available: false }
        : e,
    ),
  };
  assert.equal(calculateRoute("b_function", "c_church", closed), null);
  assert.equal(calculateRoute("c_sacristy", "b_office", closed), null);
});

test("ramps start outside, never at the basement", () => {
  for (const side of ["left", "right"]) {
    assert.deepEqual(route(`outside_${side}`, `c_front_${side}`).nodes, [
      `outside_${side}`,
      `c_front_${side}`,
    ]);
  }
  assert.ok(
    graph.edges
      .filter((e) => e.kind === "ramp")
      .every((e) => e.from.startsWith("outside_") && e.to.startsWith("c_")),
  );
});

test("right-side walkway is reached through Multipurpose Hall, never directly from stairs", () => {
  for (const id of ["bell_entry", "comfort_entry"]) {
    const expected = ["b_front_right", "b_front_hall", "b_multipurpose", id];
    assert.deepEqual(route("b_front_right", id).nodes, expected);
    assert.deepEqual(route(id, "b_front_right").nodes, [...expected].reverse());
    assert.ok(
      route("b_front_hall", id).nodes.every(
        (node) => graph.nodes.find((n) => n.id === node).floorId === "basement",
      ),
    );
    const state = change(
      change(initialNavigation("altar"), {
        type: "found",
        id: "b_front_right",
      }),
      {
        type: "destination",
        id: building.destinations.find((d) => d.nodeId === id).id,
      },
    );
    assert.ok(state.route.nodes.includes("b_multipurpose"));
    assert.equal(state.route.nodes[0], "b_front_right");
    assert.equal(state.route.nodes.at(-1), id);
    const closed = {
      ...graph,
      edges: graph.edges.map((e) =>
        e.to === id ? { ...e, available: false } : e,
      ),
    };
    assert.equal(calculateRoute("b_front_hall", id, closed), null);
    const hallClosed = {
      ...graph,
      edges: graph.edges.map((e) =>
        e.to === "b_multipurpose" || e.from === "b_multipurpose"
          ? { ...e, available: false }
          : e,
      ),
    };
    assert.equal(calculateRoute("b_front_right", id, hallClosed), null);
  }
});

test("stairs and ramps have explicit instructions; a landing scan confirms the floor", () => {
  for (const [id, destination, action, kind] of [
    ["b_front_right", "altar", "up", "stairs"],
    ["c_front_right", "parish-store", "down", "stairs"],
  ]) {
    const state = change(initialNavigation(destination), { type: "found", id });
    const instruction = navigationInstruction(state, building);
    assert.equal(instruction.transition, kind);
    assert.match(instruction.label, new RegExp(` ${action} to `));
    assert.equal(state.currentCheckpointId, id);
    const lost = change(state, { type: "lost", id });
    assert.equal(lost.currentCheckpointId, id);
    const confirmed = change(lost, { type: "found", id: state.route.nodes[1] });
    assert.equal(confirmed.currentCheckpointId, state.route.nodes[1]);
  }
});

test("destinations are public boundaries and staff checkpoints are never recognized", () => {
  assert.equal(building.destinations.length, 10);
  assert.ok(building.destinations.every((d) => !/stair|aisle/i.test(d.name)));
  assert.ok(building.destinations.some((d) => d.name === "Comfort Room"));
  assert.ok(
    building.checkpoints.every(
      (c) => c.targetIndex !== null && !c.id.includes("rear_"),
    ),
  );
  assert.ok(houseBuilding.checkpoints.some((c) => c.targetIndex === 0));
  for (const destination of building.destinations) {
    const state = change(initialNavigation(destination.id), {
      type: "found",
      id: destination.nodeId,
    });
    assert.equal(
      navigationInstruction(state, building).direction,
      "destination",
    );
  }
  const state = initialNavigation("altar");
  assert.equal(change(state, { type: "found", id: "c_rear_left" }), state);
  assert.equal(change(state, { type: "found", id: "terrace_door" }), state);
});
