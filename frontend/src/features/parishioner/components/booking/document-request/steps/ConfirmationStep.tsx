import { BookingCard } from "../..";
import type { DocumentRequestBooking } from "../../../../types/document";
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
                    {request.document_type}
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
              {booking.reference_number || "-"}
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
      <div className="rounded-3xl border border-[#B22222]/20 bg-red-50 p-6">
        <h3 className="mb-4 text-xl font-bold text-[#B22222]">Declaration</h3>
        <p className="mb-6 text-gray-700">
          I certify that the request details and payment information provided
          are true and accurate.
        </p>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            className="mt-1 h-5 w-5 accent-[#B22222]"
          />
          <span className="text-sm text-gray-700">
            I have reviewed the information and agree to the parish's request
            policies.
          </span>
        </label>
      </div>
    </div>
  );
}
