import { BookingCard } from "../..";

import type { MassIntentionBooking } from "../../../../types/mass";
import type { Dispatch, SetStateAction } from "react";

interface ConfirmationStepProps {
  booking: MassIntentionBooking;
  agree: boolean;
  setAgree: Dispatch<SetStateAction<boolean>>;
}

export default function ConfirmationStep({
  booking,
  agree,
  setAgree,
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
              label="Intention Date"
              value={
                booking.intention_date?.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }) ?? "-"
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
      <div className="rounded-3xl border border-[#B22222]/20 bg-red-50 p-6 lg:col-span-2">
        <h3 className="mb-4 text-xl font-bold text-[#B22222]">Declaration</h3>
        <p className="mb-6 text-gray-700">
          I certify that the Mass Intention and payment information provided are
          true and accurate.
        </p>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
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
        </label>
      </div>
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
