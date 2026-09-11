import { BookingCard } from "../..";
import type { DocumentRequestBooking } from "../../../../types/document";
import { formatPhpCurrency } from "@/utils/currency";
import { ReceiptText, FileText } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface ConfirmationStepProps {
  booking: DocumentRequestBooking;
  agree: boolean;
  setAgree: Dispatch<SetStateAction<boolean>>;
}

export default function ConfirmationStep({
  booking,
  agree,
  setAgree,
}: ConfirmationStepProps) {
  const total = booking.requests.reduce(
    (sum, request) => sum + request.price,
    0,
  );
  const documentSummary = Array.from(
    new Set(booking.requests.map((request) => request.document_type)),
  ).map((type) => {
    const requests = booking.requests.filter(
      (request) => request.document_type === type,
    );

    return {
      type,
      quantity: requests.length,
      unitPrice: requests[0]?.price ?? 0,
      subtotal: requests.reduce((sum, request) => sum + request.price, 0),
    };
  });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <BookingCard title="Request Summary">
        <div className="space-y-4">
          {documentSummary.map((item) => (
            <div
              key={item.type}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-2">
                  <FileText size={20} className="text-[#B22222]" />
                </div>

                <div>
                  <p className="font-medium">{item.type}</p>

                  <p className="text-sm text-gray-500">
                    {item.quantity} × {formatPhpCurrency(item.unitPrice)}
                  </p>
                </div>
              </div>

              <span className="font-semibold text-[#B22222]">
                {formatPhpCurrency(item.subtotal)}
              </span>
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>

              <span className="text-[#B22222]">{formatPhpCurrency(total)}</span>
            </div>
          </div>
        </div>
      </BookingCard>

      {/* Payment */}
      <BookingCard title="Payment Information">
        <div className="space-y-5">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Payment Method</p>
            <p className="mt-1 font-semibold">
              {booking.payment_method === "gcash"
                ? "GCash"
                : "Cash at Parish Office"}
            </p>
          </div>
          {booking.payment_method === "gcash" ? (
            <>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Reference Number</p>

                <p className="mt-1 font-semibold">
                  {booking.reference_number || "-"}
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              Your request will remain pending until you pay at the parish
              office and staff confirms the cash received.
            </div>
          )}

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ReceiptText size={20} className="text-[#B22222]" />

              <span className="font-semibold">Payment Receipt</span>
            </div>

            {booking.receipt ? (
              <div className="space-y-3">
                {booking.receipt.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(booking.receipt)}
                    alt="Receipt"
                    className="max-h-96 w-full rounded-lg border object-contain"
                  />
                ) : (
                  <p className="rounded-lg border p-4 text-sm">
                    PDF receipt uploaded successfully.
                  </p>
                )}

                <p className="break-all text-sm text-gray-500">
                  {booking.receipt.name}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No receipt uploaded.</p>
            )}
          </div>

          {booking.remarks && (
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Remarks</p>

              <p className="mt-1 whitespace-pre-wrap">{booking.remarks}</p>
            </div>
          )}
        </div>
      </BookingCard>
      <div className="rounded-3xl border border-[#B22222]/20 bg-red-50 p-6">
        <h3 className="mb-4 text-xl font-bold text-[#B22222]">Declaration</h3>
        <p className="mb-6 text-gray-700">
          I certify that I am the registered account holder and official
          claimant, and that the record-owner relationship and payment details
          provided are true and accurate.
        </p>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            className="mt-1 h-5 w-5 accent-[#B22222]"
          />
          <span className="text-sm text-gray-700">
            I understand that I cannot appoint another person as the requester
            or claimant for this online request.
          </span>
        </label>
      </div>
    </div>
  );
}
