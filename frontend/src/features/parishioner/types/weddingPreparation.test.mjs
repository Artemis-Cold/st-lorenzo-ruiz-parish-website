import test from "node:test";
import assert from "node:assert/strict";
import { emptyPreparation, updatePreparation } from "./wedding.ts";

for (const role of ["bride", "groom"]) {
  for (const source of ["baptism", "confirmation"]) {
    for (const relationship of ["father", "mother"]) {
      test(`${role}: ${relationship}'s birthplace copies and syncs from ${source}`, () => {
        const other = source === "baptism" ? "confirmation" : "baptism";
        const p = person();
        p.preparations = { [source]: emptyPreparation(p, role, source) };
        p.preparations[source].parents.find(
          (parent) => parent.relationship === relationship,
        ).birth_place = "Taysan";
        p.preparations[other] = emptyPreparation(p, role, other);
        assert.equal(
          p.preparations[other].parents.find(
            (parent) => parent.relationship === relationship,
          ).birth_place,
          "Taysan",
        );
        // Match by relationship, not position in the array.
        p.preparations[other].parents.reverse();
        const original = structuredClone(p);
        const next = {
          ...p.preparations[source],
          parents: p.preparations[source].parents.map((parent) =>
            parent.relationship === relationship
              ? { ...parent, birth_place: "Manila" }
              : parent,
          ),
        };
        const updated = updatePreparation(p, source, next);
        assert.equal(
          updated.preparations[other].parents.find(
            (parent) => parent.relationship === relationship,
          ).birth_place,
          "Manila",
        );
        assert.equal(
          updated.preparations[other].parents.find(
            (parent) => parent.relationship !== relationship,
          ).birth_place,
          "",
        );
        assert.equal(
          updated.preparations[other].sponsors,
          p.preparations[other].sponsors,
        );
        assert.deepEqual(p, original);
        const cleared = updatePreparation(updated, source, {
          ...next,
          parents: next.parents.map((parent) =>
            parent.relationship === relationship
              ? { ...parent, birth_place: "" }
              : parent,
          ),
        });
        assert.equal(
          cleared.preparations[other].parents.find(
            (parent) => parent.relationship === relationship,
          ).birth_place,
          "",
        );
      });
    }
  }
}

test("Parents' birthplaces do not copy or sync when Baptism is Yes", () => {
  const p = person("yes");
  p.preparations = { baptism: emptyPreparation(p, "bride", "baptism") };
  p.preparations.baptism.parents[0].birth_place = "Taysan";
  p.preparations.confirmation = emptyPreparation(p, "bride", "confirmation");
  assert.equal(p.preparations.confirmation.parents[0].birth_place, "");
  const updated = updatePreparation(p, "confirmation", {
    ...p.preparations.confirmation,
    parents: p.preparations.confirmation.parents.map((parent) => ({
      ...parent,
      birth_place: "Manila",
    })),
  });
  assert.equal(updated.preparations.baptism.parents[0].birth_place, "Taysan");
});

function person(baptism = "no") {
  const name = { first_name: "Ana", middle_initial: "", last_name: "Cruz" };
  return {
    ...name,
    address: "Taysan",
    age: 25,
    contact_number: "09171234567",
    father: name,
    mother: name,
    church: {
      baptism_status: baptism,
      confirmation_status: "no",
      baptized_in: "",
      confirmed_in: "",
    },
  };
}

for (const role of ["bride", "groom"]) {
  for (const source of ["baptism", "confirmation"]) {
    const other = source === "baptism" ? "confirmation" : "baptism";
    test(`${role}: birthday copies when ${other} is opened after ${source}`, () => {
      const p = person();
      const first = emptyPreparation(p, role, source);
      first.candidate.birth_date = "2000-01-02";
      p.preparations = { [source]: first };
      assert.equal(
        emptyPreparation(p, role, other).candidate.birth_date,
        "2000-01-02",
      );
    });
    test(`${role}: edits and clearing ${source} birthday sync only the birthday`, () => {
      const p = person();
      p.preparations = {
        baptism: emptyPreparation(p, role, "baptism"),
        confirmation: emptyPreparation(p, role, "confirmation"),
      };
      const original = structuredClone(p);
      const next = {
        ...p.preparations[source],
        candidate: {
          ...p.preparations[source].candidate,
          birth_date: "1999-06-01",
        },
      };
      const updated = updatePreparation(p, source, next);
      assert.equal(
        updated.preparations[other].candidate.birth_date,
        "1999-06-01",
      );
      assert.equal(
        updated.preparations[other].sponsors,
        p.preparations[other].sponsors,
      );
      assert.deepEqual(p, original);
      const cleared = updatePreparation(updated, source, {
        ...next,
        candidate: { ...next.candidate, birth_date: "" },
      });
      assert.equal(cleared.preparations[other].candidate.birth_date, "");
    });
  }
}

test("Baptism Yes does not copy or synchronize birthdays", () => {
  const p = person("yes");
  p.preparations = { baptism: emptyPreparation(p, "bride", "baptism") };
  p.preparations.baptism.candidate.birth_date = "2000-01-02";
  p.preparations.confirmation = emptyPreparation(p, "bride", "confirmation");
  assert.equal(p.preparations.confirmation.candidate.birth_date, "");
  const next = {
    ...p.preparations.confirmation,
    candidate: {
      ...p.preparations.confirmation.candidate,
      birth_date: "1999-01-02",
    },
  };
  assert.equal(
    updatePreparation(p, "confirmation", next).preparations.baptism.candidate
      .birth_date,
    "2000-01-02",
  );
});

test("Editing another field does not overwrite a birthday", () => {
  const p = person();
  p.preparations = {
    baptism: emptyPreparation(p, "bride", "baptism"),
    confirmation: emptyPreparation(p, "bride", "confirmation"),
  };
  p.preparations.confirmation.candidate.birth_date = "2000-01-02";
  const next = {
    ...p.preparations.baptism,
    candidate: { ...p.preparations.baptism.candidate, address: "New address" },
  };
  assert.equal(
    updatePreparation(p, "baptism", next).preparations.confirmation.candidate
      .birth_date,
    "2000-01-02",
  );
});

for (const role of ["bride", "groom"]) {
  for (const source of ["baptism", "confirmation"]) {
    test(`${role}: place of birth copies, updates and clears from ${source}`, () => {
      const other = source === "baptism" ? "confirmation" : "baptism";
      const p = person();
      p.preparations = { [source]: emptyPreparation(p, role, source) };
      p.preparations[source].candidate.birth_place = "Taysan, Batangas";
      p.preparations[other] = emptyPreparation(p, role, other);
      assert.equal(
        p.preparations[other].candidate.birth_place,
        "Taysan, Batangas",
      );
      p.preparations[other].candidate.birth_date = "2000-01-02";
      const original = structuredClone(p);
      const next = {
        ...p.preparations[source],
        candidate: {
          ...p.preparations[source].candidate,
          birth_place: "Batangas City",
        },
      };
      const updated = updatePreparation(p, source, next);
      assert.equal(
        updated.preparations[other].candidate.birth_place,
        "Batangas City",
      );
      assert.equal(
        updated.preparations[other].candidate.birth_date,
        "2000-01-02",
      );
      assert.equal(
        updated.preparations[other].sponsors,
        p.preparations[other].sponsors,
      );
      assert.deepEqual(p, original);
      const cleared = updatePreparation(updated, source, {
        ...next,
        candidate: { ...next.candidate, birth_place: "" },
      });
      assert.equal(cleared.preparations[other].candidate.birth_place, "");
    });
  }
}

test("Baptism Yes does not copy or synchronize place of birth", () => {
  const p = person("yes");
  p.preparations = { baptism: emptyPreparation(p, "bride", "baptism") };
  p.preparations.baptism.candidate.birth_place = "Taysan";
  p.preparations.confirmation = emptyPreparation(p, "bride", "confirmation");
  assert.equal(p.preparations.confirmation.candidate.birth_place, "");
  const updated = updatePreparation(p, "confirmation", {
    ...p.preparations.confirmation,
    candidate: {
      ...p.preparations.confirmation.candidate,
      birth_place: "Manila",
    },
  });
  assert.equal(updated.preparations.baptism.candidate.birth_place, "Taysan");
});

test("Changing the bride's place of birth leaves the groom untouched", () => {
  const bride = person();
  const groom = person();
  for (const p of [bride, groom]) {
    p.preparations = {
      baptism: emptyPreparation(p, "bride", "baptism"),
      confirmation: emptyPreparation(p, "bride", "confirmation"),
    };
  }
  const originalGroom = structuredClone(groom);
  const booking = { applicant: { bride, groom } };
  const updated = {
    ...booking,
    applicant: {
      ...booking.applicant,
      bride: updatePreparation(bride, "baptism", {
        ...bride.preparations.baptism,
        candidate: {
          ...bride.preparations.baptism.candidate,
          birth_place: "Taysan",
        },
      }),
    },
  };
  assert.deepEqual(updated.applicant.groom, originalGroom);
  assert.equal(
    updated.applicant.bride.preparations.confirmation.candidate.birth_place,
    "Taysan",
  );
});
