import test from "node:test";
import assert from "node:assert/strict";
import { canDisplayBookingPayment } from "./bookingPaymentVisibility.ts";

const booking = (serviceCode, missingRequirements = [], required = true) => ({
  serviceCode,
  missingRequirements,
  payment: { required },
});

for (const service of ["baptism", "wedding", "funeral"]) {
  test(`${service} hides payment until all requirements are submitted`, () => {
    const detail = booking(service, [{ key: "missing-document" }]);
    assert.equal(canDisplayBookingPayment(detail), false);
    detail.missingRequirements = [];
    assert.equal(canDisplayBookingPayment(detail), true);
    detail.missingRequirements = [{ key: "sponsor-certificate" }];
    assert.equal(canDisplayBookingPayment(detail), false);
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
