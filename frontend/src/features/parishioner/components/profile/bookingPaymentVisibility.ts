import type { ParishionerBookingDetail } from "@/services/parishionerBookingService";

export function canDisplayBookingPayment(
  booking: Pick<
    ParishionerBookingDetail,
    | "serviceCode"
    | "missingRequirements"
    | "payment"
    | "requirementReview"
    | "scheduleReview"
  > | null,
): boolean {
  if (!booking?.payment.required) return false;
  if (booking.scheduleReview && booking.scheduleReview.status !== "confirmed")
    return false;
  return (
    ![
      "baptism",
      "wedding",
      "funeral",
      "confirmation",
      "first-communion",
    ].includes(booking.serviceCode) ||
    (booking.missingRequirements.length === 0 &&
      booking.requirementReview?.allApproved === true &&
      Boolean(booking.requirementReview.physicalCopiesReceivedAt))
  );
}
