import { test } from "node:test";
import assert from "node:assert/strict";
import { validationStep } from "./validationStep.ts";
import { validateFormation } from "./formationValidation.ts";

test("submission errors return to the correct editable step", () => {
  for (const [service, key, expected] of [
    ["baptism", "baptizand.birth_date", 4],
    ["baptism", "god_parents.1.first_name", 5],
    ["wedding", "applicant.bride.age", 4],
    ["wedding", "applicant.groom.first_name", 5],
    ["wedding", "applicant.bride.church.baptism_status", 7],
    ["wedding", "applicant.groom.preparations.baptism.birth_date", 7],
    ["wedding", "sponsors.0.first_name", 6],
    ["funeral", "deceased.informant.contact_number", 6],
    ["funeral", "deceased.church_life.active", 5],
    ["funeral", "deceased.first_name", 4],
    ["mass", "groups.0.entries.1.names", 3],
    ["mass", "mass_event_id", 1],
    ["document", "requests.0.details.name", 2],
    ["document", "receipt", 3],
    ["confirmation", "candidate.birth_date", 4],
    ["confirmation", "sponsors.0.address", 5],
    ["first-communion", "parents.0.birth_place", 2],
    ["baptism", "booking_slot_id", 2],
  ])
    assert.equal(
      validationStep(service, { [key]: ["Invalid"] }, 8),
      expected,
      key,
    );
});

test("earliest affected step wins and unknown server failures stay on current step", () => {
  assert.equal(
    validationStep(
      "wedding",
      {
        "applicant.groom.preparations.baptism.birth_date": ["Invalid"],
        "applicant.bride.age": ["Invalid"],
      },
      8,
    ),
    4,
  );
  assert.equal(validationStep("mass", { server: ["Unavailable"] }, 5), 5);
});

const booking = () => ({
  candidate: {
    first_name: "Ana",
    last_name: "Cruz",
    parish_origin: "St. Lorenzo",
    baptism_date: "2015-05-01",
    baptism_church: "St. Lorenzo",
    birth_date: "2014-01-01",
    birth_place: "Taysan",
    gender: "Female",
    address: "Taysan",
    contact_number: "09171234567",
  },
  parents: ["father", "mother"].map((relationship) => ({
    relationship,
    first_name: "Parent",
    last_name: "Cruz",
    birth_place: "Taysan",
  })),
  sponsors: [],
});
test("formation errors identify required fields, invalid phone, and date order", () => {
  const data = booking();
  assert.deepEqual(
    validateFormation(data, "Applicant Details", "2026-10-19"),
    {},
  );
  data.candidate.first_name = "   ";
  data.candidate.contact_number = "0917";
  data.candidate.baptism_date = "2010-01-01";
  data.parents[1].birth_place = "";
  const errors = validateFormation(data, "Applicant Details", "2026-10-19");
  for (const key of [
    "candidate.first_name",
    "candidate.contact_number",
    "candidate.baptism_date",
    "parents.1.birth_place",
  ])
    assert.ok(errors[key]);
  assert.deepEqual(validateFormation(data, "Requirements", "2026-10-19"), {});
});
test("confirmation sponsor errors identify the specific sponsor", () => {
  const data = booking();
  assert.ok(validateFormation(data, "Sponsors").sponsors);
  data.sponsors = [
    {
      role: "godmother",
      first_name: "Ana",
      last_name: "Cruz",
      address: "",
      requirement_type: "",
    },
  ];
  assert.deepEqual(Object.keys(validateFormation(data, "Sponsors")), [
    "sponsors.0.address",
    "sponsors.0.requirement_type",
  ]);
});
