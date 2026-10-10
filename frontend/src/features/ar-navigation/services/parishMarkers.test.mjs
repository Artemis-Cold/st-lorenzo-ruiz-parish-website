import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { decode } from "@msgpack/msgpack";
import {
  parishCompiledMarkers,
  parishMarkers,
} from "../maps/parish/markers.ts";
import { parishBuilding } from "../maps/parish/config.ts";
import { houseBuilding } from "../maps/house/config.ts";
import { checkpointForTarget } from "./targetMapper.ts";
import { validateTargetFile } from "./targetFile.ts";

test("active parish checkpoints keep their stable compiled target indices", () => {
  assert.equal(parishMarkers.length, 14);
  assert.equal(new Set(parishMarkers.map((m) => m.nodeId)).size, 14);
  assert.equal(new Set(parishMarkers.map((m) => m.code)).size, 14);
  assert.deepEqual(
    parishMarkers.map((marker) => marker.targetIndex),
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 15, 16],
  );
  for (const marker of parishMarkers) {
    assert.equal(
      checkpointForTarget(marker.targetIndex, parishBuilding.checkpoints)
        .nodeId,
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

  const compiled = decode(bytes);
  const naturalDimensions = {
    0: [304, 1029],
    1: [292, 890],
    3: [1280, 247],
    4: [1280, 204],
    6: [208, 929],
    7: [351, 1146],
    10: [960, 1280],
    13: [963, 643],
    15: [444, 1126],
  };
  for (const [index, [width, height]] of Object.entries(naturalDimensions)) {
    assert.deepEqual(compiled.dataList[index].targetImage, { width, height });
  }
});

test("natural landmarks replace matching codes and print pack contains only fallbacks", () => {
  const naturalCodes = [
    "P00",
    "P01",
    "P03",
    "P04",
    "P06",
    "P07",
    "P10",
    "P13",
    "P15",
  ];
  const pack = readFileSync(
    new URL("../maps/parish/assets/markers-print.html", import.meta.url),
    "utf8",
  );
  assert.equal((pack.match(/<article>/g) || []).length, 6);
  for (const marker of parishCompiledMarkers) {
    const svg = readFileSync(
      new URL(
        `../maps/parish/assets/marker-${marker.code}.svg`,
        import.meta.url,
      ),
      "utf8",
    );
    assert.match(svg, /St. Lorenzo Ruiz Parish/);
    assert.match(svg, />AR NAVIGATION<\/text>/);
    assert.doesNotMatch(svg, /SET 2/);
    assert.ok(svg.includes(marker.code));
    const active = parishMarkers.some((item) => item.code === marker.code);
    if (naturalCodes.includes(marker.code)) {
      assert.ok(
        readFileSync(
          new URL(
            `../maps/parish/assets/target-${marker.code}.jpg`,
            import.meta.url,
          ),
        ).length > 0,
      );
      assert.ok(!pack.includes(`<h2>${marker.code} ·`));
    } else if (!active) {
      assert.ok(!pack.includes(`<h2>${marker.code} ·`));
    } else {
      assert.ok(pack.includes(svg));
      assert.ok(pack.includes(`<h2>${marker.code} ·`));
    }
  }
  assert.equal(parishMarkers[6].facing, 0);
  assert.equal(parishMarkers[7].facing, 0);
  assert.doesNotMatch(pack, /test markers|TEST PLACEMENT|visitor-ready/i);
});
