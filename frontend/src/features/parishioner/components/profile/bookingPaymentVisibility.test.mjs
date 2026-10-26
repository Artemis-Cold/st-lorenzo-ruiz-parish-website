import test from "node:test";
import assert from "node:assert/strict";
import { canDisplayBookingPayment } from "./bookingPaymentVisibility.ts";

const booking = (serviceCode, missingRequirements = [], required = true) => ({
  serviceCode,
  missingRequirements,
  payment: { required },
});

for (const service of [
  "baptism",
  "wedding",
  "funeral",
  "confirmation",
  "first-communion",
]) {
  test(`${service} shows payment after schedule confirmation without documents`, () => {
    const detail = booking(service, [{ key: "missing-document" }]);
    detail.scheduleReview = { status: "awaiting_review" };
    assert.equal(canDisplayBookingPayment(detail), false);
    detail.scheduleReview.status = "rejected";
    assert.equal(canDisplayBookingPayment(detail), false);
    detail.scheduleReview.status = "confirmed";
    assert.equal(canDisplayBookingPayment(detail), true);
    detail.requirementReview = {
      allApproved: false,
      physicalCopiesReceivedAt: null,
    };
    assert.equal(canDisplayBookingPayment(detail), true);
  });
}

test("other services retain their existing payment visibility", () => {
  for (const service of ["mass-intention", "document-request"]) {
    assert.equal(
      canDisplayBookingPayment(booking(service, [{ key: "document" }])),
      true,
    );
  }
});

test("loading and bookings without required payment show no payment section", () => {
  assert.equal(canDisplayBookingPayment(null), false);
  assert.equal(canDisplayBookingPayment(booking("wedding", [], false)), false);
});
