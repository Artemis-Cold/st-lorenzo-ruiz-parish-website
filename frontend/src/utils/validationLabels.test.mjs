import test from "node:test";
import assert from "node:assert/strict";
import { validationLabel } from "./validationLabels.ts";

test("Field names are title-cased without changing acronyms or possessives", () => {
  for (const [input, expected] of [
    ["parish_origin", "Parish Origin"],
    ["father birth place", "Father Birth Place"],
    ["Sponsor 2 first name", "Sponsor 2 First Name"],
    ["Bride's first name", "Bride's First Name"],
    ["GCash reference number", "GCash Reference Number"],
    ["  first   name ", "First Name"],
  ])
    assert.equal(validationLabel(input), expected);
  assert.equal(
    `${validationLabel("parish origin")} is required.`,
    "Parish Origin is required.",
  );
});
