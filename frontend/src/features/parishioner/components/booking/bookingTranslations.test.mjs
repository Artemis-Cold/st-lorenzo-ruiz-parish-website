import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { translateBookingLabel } from "./bookingTranslations.ts";

for (const page of [
  "Baptism",
  "Wedding",
  "Funeral",
  "FormationSacrament",
  "Mass",
  "Document",
]) {
  test(`${page}: all step labels and continue buttons have Tagalog translations`, () => {
    const source = readFileSync(
      new URL(`../../pages/${page}.tsx`, import.meta.url),
      "utf8",
    );
    const array = source.match(
      /const (?:stepLabels|steps) = \[([\s\S]*?)\n?\];/,
    );
    assert.ok(array, "Step labels must be found");
    const labels = [...array[1].matchAll(/"([^"]+)"/g)].map(
      (match) => match[1],
    );
    assert.ok(labels.length > 0);
    for (const label of labels) {
      assert.ok(
        translateBookingLabel(label),
        `Missing translation for ${label}`,
      );
      assert.ok(translateBookingLabel(`Continue to ${label}`));
    }
  });
}

test("Navigation actions and newly added section headings have translations", () => {
  for (const label of [
    "Back",
    "Previous",
    "Next",
    "Submit Booking",
    "Submitting...",
    "Review Booking",
    "Requested Schedule",
    "Confirmed Schedule",
    "Available Time Slots",
    "Confirmation Candidate",
    "First Communion Candidate",
    "Confirmation Package",
    "First Communion Package",
    "Baptism Requirements",
    "Wedding Requirements",
    "Funeral Requirements",
    "Confirmation Requirements",
    "First Communion Requirements",
  ]) {
    assert.ok(translateBookingLabel(label), label);
  }
});

test("Confirmation review and Confirmation sacrament headings remain distinct", () => {
  assert.equal(
    translateBookingLabel("Confirmation"),
    "Pagsusuri at pagpapatunay",
  );
  assert.equal(
    translateBookingLabel("Confirmation Requirements"),
    "Mga kailangan para sa Kumpil",
  );
});
