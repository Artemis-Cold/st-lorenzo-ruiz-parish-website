import type { ParishionerBookingDetail } from "@/services/parishionerBookingService";

export function canDisplayBookingPayment(
  booking: Pick<
    ParishionerBookingDetail,
    "serviceCode" | "missingRequirements" | "payment"
  > | null,
): boolean {
  if (!booking?.payment.required) return false;
  return (
    !["baptism", "wedding", "funeral"].includes(booking.serviceCode) ||
    booking.missingRequirements.length === 0
  );
}
