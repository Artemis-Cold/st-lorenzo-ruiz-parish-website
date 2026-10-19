import ReviewSection from "../../ReviewSection";
import { BookingTranslation } from "@/features/parishioner/components/booking/BookingLabel";
import BookingLabel from "@/features/parishioner/components/booking/BookingLabel";

import { useAuth } from "@/contexts/AuthContext";

import type { MassIntentionBooking } from "../../../../types/mass";
import type { Dispatch, SetStateAction } from "react";
import type { ParishEvent } from "@/services/eventService";
import { formatPhpCurrency } from "@/utils/currency";

interface ConfirmationStepProps {
  booking: MassIntentionBooking;
  agree: boolean;
  onEdit: (step: number) => void;
  setAgree: Dispatch<SetStateAction<boolean>>;
  linePrice: number | null;
  selectedMass: ParishEvent | null;
}

export default function ConfirmationStep({
  booking,
  onEdit,
  agree,
  setAgree,
  linePrice,
  selectedMass,
}: ConfirmationStepProps) {
  const { user } = useAuth();
  const totalIntentions = booking.groups.reduce(
    (sum, group) => sum + group.entries.length,
    0,
  );

  const totalAmount = totalIntentions * (linePrice ?? 0);

  return (
    <div className="space-y-6">
      <ReviewSection
        title="Mass Schedule"
        onEdit={() => onEdit(1)}
        data={{
          parishioner: user?.full_name,
          intention_date: booking.intention_date,
          mass: selectedMass?.title,
          time: selectedMass
            ? new Date(selectedMass.startsAt).toLocaleTimeString("en-PH", {
                hour: "numeric",
                minute: "2-digit",
              })
            : null,
          venue: selectedMass?.location,
        }}
      />
      <ReviewSection
        title="Intention Types"
        onEdit={() => onEdit(2)}
        data={booking.groups.map((group) => group.type).join(", ")}
      />
      <ReviewSection
        title="Intention Names"
        onEdit={() => onEdit(3)}
        data={Object.fromEntries(
          booking.groups.map((group) => [
            group.type,
            group.entries.map((entry, index) => ({
              entry: index + 1,
              names: entry.names.filter((name) => name.trim()).join(", "),
            })),
          ]),
        )}
      />
      <ReviewSection
        title="Payment Information"
        onEdit={() => onEdit(4)}
        data={{
          payment_method: "GCash",
          rate_per_entry:
            linePrice === null
              ? "Unavailable / Hindi makuha"
              : formatPhpCurrency(linePrice),
          numbered_entries: totalIntentions,
          total:
            linePrice === null
              ? "Unavailable / Hindi makuha"
              : formatPhpCurrency(totalAmount),
          reference_number: booking.reference_number,
          receipt: booking.receipt?.name ?? "Not provided / Hindi ibinigay",
          remarks: booking.remarks,
        }}
      />
      <div className="rounded-3xl border border-[#B22222]/20 bg-red-50 p-6 lg:col-span-2">
        <h3 className="mb-4 text-xl font-bold text-[#B22222]">
          Declaration
          <BookingTranslation text="Declaration" />
        </h3>
        <p className="mb-6 text-gray-700">
          I certify that the Mass Intention and payment information provided are
          true and accurate.
        </p>
        <BookingLabel className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            className="mt-1 h-5 w-5 accent-[#B22222]"
          />
          <span className="text-sm text-gray-700">
            I have reviewed the information above and agree to the parish's
            booking policies.
          </span>
        </BookingLabel>
      </div>
    </div>
  );
}
