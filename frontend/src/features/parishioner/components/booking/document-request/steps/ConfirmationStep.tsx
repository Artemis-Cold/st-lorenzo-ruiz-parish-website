import { BookingCard } from "../..";
import type { DocumentRequestBooking } from "../../../../types/document";
import { ReceiptText, FileText } from "lucide-react";

interface ConfirmationStepProps {
  booking: DocumentRequestBooking;
}

export default function ConfirmationStep({
  booking,
}: ConfirmationStepProps) {
  const total = booking.requests.reduce(
    (sum, request) => sum + request.price,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <BookingCard title="Request Summary">
        <div className="space-y-4">
          {booking.requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-2">
                  <FileText
                    size={20}
                    className="text-[#B22222]"
                  />
                </div>

                <div>
                  <p className="font-medium">
                    {request.documentType}
                  </p>

                  <p className="text-sm text-gray-500">
                    ₱{request.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <span className="font-semibold text-[#B22222]">
                ₱{request.price.toLocaleString()}
              </span>
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>

              <span className="text-[#B22222]">
                ₱{total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </BookingCard>

      {/* Payment */}
      <BookingCard title="Payment Information">
        <div className="space-y-5">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Reference Number
            </p>

            <p className="mt-1 font-semibold">
              {booking.referenceNumber || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ReceiptText
                size={20}
                className="text-[#B22222]"
              />

              <span className="font-semibold">
                Payment Receipt
              </span>
            </div>

            {booking.receipt ? (
              <div className="space-y-3">
                <img
                  src={URL.createObjectURL(booking.receipt)}
                  alt="Receipt"
                  className="max-h-96 w-full rounded-lg border object-contain"
                />

                <p className="text-sm text-gray-500">
                  {booking.receipt.name}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No receipt uploaded.
              </p>
            )}
          </div>

          {booking.remarks && (
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Remarks</p>

              <p className="mt-1 whitespace-pre-wrap">
                {booking.remarks}
              </p>
            </div>
          )}
        </div>
      </BookingCard>
    </div>
  );
}