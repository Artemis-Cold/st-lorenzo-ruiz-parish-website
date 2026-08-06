import { BookingCard } from "../..";

import type { MassIntentionBooking } from "../../../../types/mass";

interface ConfirmationStepProps {
  booking: MassIntentionBooking;
}

export default function ConfirmationStep({
  booking,
}: ConfirmationStepProps) {
  const totalIntentions = booking.groups.reduce(
    (sum, group) => sum + group.entries.length,
    0,
  );

  const totalAmount = totalIntentions * 100;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Payment Summary */}
      <BookingCard title="Payment Summary">
        <div className="space-y-6">
          {/* Total */}
          <div className="rounded-xl border border-red-200 p-5">
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-700">
                Total
              </span>

              <span className="text-3xl font-semibold text-[#B22222]">
                ₱{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="divide-y rounded-lg border border-gray-200">
            <SummaryRow
              label="Parishioner"
              value="Ihra Cueto"
            />

            <SummaryRow
              label="Mass Intention Type"
              value={
                booking.groups.length > 0
                  ? booking.groups
                      .map((g) => g.type)
                      .join(", ")
                  : "-"
              }
            />

            <SummaryRow
              label="Payment Method"
              value="GCash"
            />

            <SummaryRow
              label="Sent To"
              value="000-0000-000"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between rounded-b-xl bg-[#B22222] px-5 py-4 text-white">
            <span className="text-2xl font-medium">
              Amount
            </span>

            <span className="text-3xl font-semibold">
              ₱{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </BookingCard>

      {/* Receipt */}
      <BookingCard title="">
        <div className="flex h-full min-h-[430px] items-center justify-center rounded-xl border border-red-200">
          {booking.receipt ? (
            booking.receipt.type.startsWith("image") ? (
              <img
                src={URL.createObjectURL(booking.receipt)}
                alt="Receipt"
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            ) : (
              <div className="text-center">
                <p className="font-medium">
                  {booking.receipt.name}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  PDF uploaded successfully
                </p>
              </div>
            )
          ) : (
            <p className="text-lg text-[#B22222]">
              Photo of Receipt
            </p>
          )}
        </div>
      </BookingCard>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({
  label,
  value,
}: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-gray-700">
        {label}
      </span>

      <span className="text-sm font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}