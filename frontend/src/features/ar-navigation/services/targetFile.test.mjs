import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { encode } from "@msgpack/msgpack";
import { validateTargetFile } from "./targetFile.ts";
import { markerManifest } from "../data/markerManifest.ts";

const count = markerManifest.length;

const target = {
  targetImage: { width: 512, height: 512 },
  matchingData: [{}],
  trackingData: [{}],
};
const file = (value) => new Uint8Array(encode(value)).buffer;
test("bundled markers match the complete entrance and hallway manifest", () => {
  const bytes = readFileSync(
    new URL("../assets/targets.mind", import.meta.url),
  );
  assert.equal(validateTargetFile(new Uint8Array(bytes).buffer), count);
});
test("requires the manifest count of current-format compiled targets", () => {
  assert.equal(
    validateTargetFile(file({ v: 2, dataList: Array(count).fill(target) })),
    count,
  );
  assert.throws(
    () => validateTargetFile(file({ v: 1, dataList: Array(count).fill(target) })),
    /exactly 12/,
  );
  assert.throws(
    () => validateTargetFile(file({ v: 2, dataList: [target] })),
    /exactly 12/,
  );
});
test("rejects empty, malformed, oversized and incomplete files", () => {
  assert.throws(() => validateTargetFile(new ArrayBuffer(0)), /smaller/);
  assert.throws(
    () => validateTargetFile(new ArrayBuffer(31 * 1024 * 1024)),
    /smaller/,
  );
  assert.throws(
    () =>
      validateTargetFile(new TextEncoder().encode("not a mind file").buffer),
    /not a valid/,
  );
  assert.throws(() => validateTargetFile(file(null)), /exactly 12/);
  assert.throws(
    () => validateTargetFile(file({ v: 2, dataList: Array(count).fill({}) })),
    /incomplete/,
  );
});
