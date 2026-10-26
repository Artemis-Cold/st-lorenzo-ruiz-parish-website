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
  return true;
}
