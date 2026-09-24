import assert from "node:assert/strict";
import test from "node:test";
import { houseGraph } from "../data/navigationGraph.ts";
import { houseDestinations } from "../data/destinations.ts";
import { calculateRoute } from "./routeEngine.ts";

const examples = [
  ["terrace_entry", "kitchen_entry", 23],
  ["terrace_entry", "room_1_entry", 6.5],
  ["terrace_entry", "bathroom_2_entry", 14.5],
  ["room_1_entry", "room_4_entry", 14],
  ["bathroom_2_entry", "kitchen_entry", 14.5],
  ["kitchen_entry", "room_1_entry", 17.5],
  ["room_3_entry", "bathroom_1_entry", 20],
];

for (const [from, to, distance] of examples) {
  test(`${from} → ${to}`, () => {
    const route = calculateRoute(from, to, houseGraph);
    assert.ok(route);
    assert.equal(route.totalDistance, distance);
    assert.equal(route.nodes[0], from);
    assert.equal(route.nodes.at(-1), to);
    console.log(`${route.nodes.join(" → ")} ≈ ${route.totalDistance} m`);
  });
}

test("all destination pairs follow listed passages and sum their distances", () => {
  for (const start of houseDestinations) {
    for (const destination of houseDestinations) {
      const route = calculateRoute(start.nodeId, destination.nodeId, houseGraph);
      assert.ok(route);
      let distance = 0;
      for (let index = 1; index < route.nodes.length; index++) {
        const from = route.nodes[index - 1];
        const to = route.nodes[index];
        const edge = houseGraph.edges.find(
          (edge) => (edge.from === from && edge.to === to) ||
            (edge.bidirectional !== false && edge.from === to && edge.to === from),
        );
        assert.ok(edge, `Unlisted passage: ${from} → ${to}`);
        distance += edge.distance;
      }
      assert.equal(route.totalDistance, distance);
    }
  }
});

const graph = {
  nodes: ["a", "b", "c", "isolated"].map((id) => ({ id, name: id })),
  edges: [
    { from: "a", to: "c", distance: 10, bidirectional: false },
    { from: "a", to: "b", distance: 2, bidirectional: false },
    { from: "b", to: "c", distance: 3, bidirectional: false },
  ],
};

test("chooses the cheaper connected detour", () => {
  assert.deepEqual(calculateRoute("a", "c", graph), {
    nodes: ["a", "b", "c"], totalDistance: 5,
  });
});
test("does not invent connections or reverse one-way passages", () => {
  assert.equal(calculateRoute("a", "isolated", graph), null);
  assert.equal(calculateRoute("c", "a", graph), null);
});
test("same start and destination is a zero-distance route", () => {
  assert.deepEqual(calculateRoute("a", "a", graph), { nodes: ["a"], totalDistance: 0 });
});
test("rejects unknown endpoints and malformed graphs", () => {
  assert.throws(() => calculateRoute("missing", "c", graph), /does not exist/);
  assert.throws(() => calculateRoute("a", "c", {
    ...graph, nodes: [...graph.nodes, graph.nodes[0]],
  }), /duplicate/);
  assert.throws(() => calculateRoute("a", "c", {
    ...graph, edges: [{ from: "a", to: "missing", distance: 1 }],
  }), /Unknown node/);
  for (const distance of [-1, NaN, Infinity]) {
    assert.throws(() => calculateRoute("a", "c", {
      ...graph, edges: [{ from: "a", to: "c", distance }],
    }), /Invalid passage distance/);
  }
});
test("recalculation starts from the newly confirmed checkpoint", () => {
  const initial = calculateRoute("terrace_entry", "room_1_entry", houseGraph);
  const updated = calculateRoute("dining_room", "room_1_entry", houseGraph);
  assert.deepEqual(initial.nodes, ["terrace_entry", "terrace_door", "left_hall_lower", "left_hall_room_1", "room_1_entry"]);
  assert.deepEqual(updated.nodes, ["dining_room", "upper_hall", "left_hall_upper", "left_hall_middle", "left_hall_room_1", "room_1_entry"]);
});

test("bathrooms use their separate drawn openings", () => {
  const route = calculateRoute("bathroom_1_entry", "bathroom_2_entry", houseGraph);
  assert.deepEqual(route.nodes, [
    "bathroom_1_entry", "bathroom_1_door", "room_2_entry", "left_hall_middle",
    "left_hall_upper", "bathroom_2_approach", "bathroom_2_entry",
  ]);
});

test("removing a physical doorway isolates its room", () => {
  for (const [from, to, destination] of [
    ["terrace_entry", "terrace_door", "terrace_entry"],
    ["bathroom_1_door", "bathroom_1_entry", "bathroom_1_entry"],
    ["bathroom_2_approach", "bathroom_2_entry", "bathroom_2_entry"],
    ["kitchen_approach", "kitchen_entry", "kitchen_entry"],
    ["left_hall_room_1", "room_1_entry", "room_1_entry"],
    ["left_hall_middle", "room_2_entry", "room_2_entry"],
    ["right_hall_middle", "room_3_entry", "room_3_entry"],
    ["right_hall_room_4", "room_4_entry", "room_4_entry"],
  ]) {
    const blocked = { ...houseGraph, edges: houseGraph.edges.filter(
      (edge) => !(edge.from === from && edge.to === to),
    ) };
    assert.equal(calculateRoute("dining_room", destination, blocked), null);
  }
});

test("Living Room is reached through a lower side opening, not its top wall", () => {
  const route = calculateRoute("dining_room", "living_room", houseGraph);
  assert.ok(route.nodes.includes("living_left_entry") || route.nodes.includes("living_right_entry"));
  const blocked = { ...houseGraph, edges: houseGraph.edges.filter(
    (edge) => edge.to !== "living_room" && edge.from !== "living_room",
  ) };
  assert.equal(calculateRoute("dining_room", "living_room", blocked), null);
});
