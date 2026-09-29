import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parishMarkers } from "../maps/parish/markers.ts";
import { parishBuilding } from "../maps/parish/config.ts";
import { houseBuilding } from "../maps/house/config.ts";
import { checkpointForTarget } from "./targetMapper.ts";
import { validateTargetFile } from "./targetFile.ts";

test("all parish public nodes have unique, contiguous target indices", () => {
  assert.equal(parishMarkers.length, 17);
  assert.equal(new Set(parishMarkers.map((m) => m.nodeId)).size, 17);
  assert.equal(new Set(parishMarkers.map((m) => m.code)).size, 17);
  for (const [index, marker] of parishMarkers.entries()) {
    assert.equal(marker.targetIndex, index);
    assert.equal(
      checkpointForTarget(index, parishBuilding.checkpoints).nodeId,
      marker.nodeId,
    );
    assert.ok(!marker.nodeId.includes("rear_"));
  }
  for (const destination of parishBuilding.destinations) {
    assert.equal(
      parishMarkers.filter((m) => m.nodeId === destination.nodeId).length,
      1,
    );
  }
  for (const edge of parishBuilding.graph.edges.filter(
    (e) => e.kind === "stairs" && e.access !== "staff",
  )) {
    assert.ok(parishMarkers.some((m) => m.nodeId === edge.from));
    assert.ok(parishMarkers.some((m) => m.nodeId === edge.to));
  }
});

test("parish compiled file has 17 targets and rejects the house file", () => {
  const bytes = readFileSync(
    new URL("../maps/parish/assets/targets.mind", import.meta.url),
  );
  assert.equal(validateTargetFile(new Uint8Array(bytes).buffer, 17), 17);
  const house = readFileSync(
    new URL("../maps/house/assets/targets.mind", import.meta.url),
  );
  assert.equal(validateTargetFile(new Uint8Array(house).buffer, 10), 10);
  assert.throws(
    () => validateTargetFile(new Uint8Array(house).buffer, 17),
    /exactly 17/,
  );
  assert.throws(
    () => validateTargetFile(new Uint8Array(bytes).buffer, 10),
    /exactly 10/,
  );
  assert.notEqual(
    checkpointForTarget(0, parishBuilding.checkpoints).id,
    checkpointForTarget(0, houseBuilding.checkpoints).id,
  );
});

test("print pack contains exactly the same artwork as the recognition source images", () => {
  const pack = readFileSync(
    new URL("../maps/parish/assets/markers-print.html", import.meta.url),
    "utf8",
  );
  assert.equal((pack.match(/<article>/g) || []).length, 17);
  for (const marker of parishMarkers) {
    const svg = readFileSync(
      new URL(
        `../maps/parish/assets/marker-${marker.code}.svg`,
        import.meta.url,
      ),
      "utf8",
    );
    assert.ok(pack.includes(svg));
    assert.match(svg, /St. Lorenzo Ruiz Parish/);
    assert.match(svg, />AR NAVIGATION<\/text>/);
    assert.doesNotMatch(svg, /SET 2/);
    assert.ok(svg.includes(marker.code));
  }
  assert.doesNotMatch(pack, /test markers|TEST PLACEMENT|visitor-ready/i);
});
