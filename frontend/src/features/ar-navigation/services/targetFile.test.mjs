import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { encode } from "@msgpack/msgpack";
import { validateTargetFile } from "./targetFile.ts";
import { markerManifest } from "../maps/house/markers.ts";

const count = markerManifest.length;

const target = {
  targetImage: { width: 512, height: 512 },
  matchingData: [{}],
  trackingData: [{}],
};
const file = (value) => new Uint8Array(encode(value)).buffer;
test("bundled markers match the current house marker manifest", () => {
  const bytes = readFileSync(
    new URL("../maps/house/assets/targets.mind", import.meta.url),
  );
  assert.equal(validateTargetFile(new Uint8Array(bytes).buffer, count), count);
});
test("requires the manifest count of current-format compiled targets", () => {
  assert.equal(
    validateTargetFile(
      file({ v: 2, dataList: Array(count).fill(target) }),
      count,
    ),
    count,
  );
  assert.throws(
    () =>
      validateTargetFile(
        file({ v: 1, dataList: Array(count).fill(target) }),
        count,
      ),
    new RegExp(`exactly ${count}`),
  );
  assert.throws(
    () => validateTargetFile(file({ v: 2, dataList: [target] }), count),
    new RegExp(`exactly ${count}`),
  );
});
test("rejects empty, malformed, oversized and incomplete files", () => {
  assert.throws(() => validateTargetFile(new ArrayBuffer(0), count), /smaller/);
  assert.throws(
    () => validateTargetFile(new ArrayBuffer(31 * 1024 * 1024), count),
    /smaller/,
  );
  assert.throws(
    () =>
      validateTargetFile(
        new TextEncoder().encode("not a mind file").buffer,
        count,
      ),
    /not a valid/,
  );
  assert.throws(
    () => validateTargetFile(file(null), count),
    new RegExp(`exactly ${count}`),
  );
  assert.throws(
    () =>
      validateTargetFile(
        file({ v: 2, dataList: Array(count).fill({}) }),
        count,
      ),
    /incomplete/,
  );
});
