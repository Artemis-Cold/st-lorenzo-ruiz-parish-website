import type { Dispatch, SetStateAction } from "react";
import { UploadCloud, ReceiptText } from "lucide-react";

import { BookingCard } from "../..";

import type { DocumentRequestBooking } from "../../../../types/document";
import gcashLogo from "@/assets/images//gcash.png";

interface PaymentStepProps {
  booking: DocumentRequestBooking;
  setBooking: Dispatch<SetStateAction<DocumentRequestBooking>>;
  readOnly?: boolean;
  errors?: Record<string, string[]>;
}

export default function PaymentStep({
  booking,
  setBooking,
  readOnly = false,
  errors,
}: PaymentStepProps) {
  const getError = (key: string) => errors?.[key]?.[0];
  const updateBooking = <K extends "reference_number" | "receipt">(
    field: K,
    value: DocumentRequestBooking[K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const totalDocuments = booking.requests.length;

  const totalAmount = booking.requests.reduce(
    (sum, request) => sum + request.price,
    0,
  );

  const inputClass = `
w-full rounded-xl border px-4 py-3 transition
${
  readOnly
    ? "border-gray-200 bg-gray-50 text-gray-700"
    : "border-gray-300 bg-white focus:border-[#B22222] focus:outline-none focus:ring-2 focus:ring-red-100"
}
`;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      {/* Payment Summary */}
      <BookingCard title="Payment Summary">
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-[#B22222] p-3 text-white">
                <ReceiptText size={22} />
              </div>

              <div>
                <h3 className="font-semibold">Document Request Summary</h3>

                <p className="text-sm text-gray-500">
                  Selected document requests
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Documents</span>

                <span>{totalDocuments}</span>
              </div>

              <div className="space-y-3">
                <p className="font-medium text-gray-700">Selected Documents</p>

                {booking.requests.length > 0 ? (
                  booking.requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                    >
                      <span className="text-gray-700">
                        {request.document_type}
                      </span>

                      <span className="font-semibold text-[#B22222]">
                        ₱{request.price.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No document selected.
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total Amount</span>

                  <span className="text-3xl font-bold text-[#B22222]">
                    ₱{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm leading-relaxed text-amber-800">
              Please settle the total amount for your selected document requests
              using the official GCash account of the parish. After payment,
              upload the receipt together with the reference number.
            </p>
          </div>
        </div>
      </BookingCard>

      {/* Payment Details */}
      <BookingCard title="GCash Payment">
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-2xl border p-5">
            <div className="flex h-15 w-15 items-center justify-center rounded-full p-2">
              <img
                src={gcashLogo}
                alt="GCash"
                className="h-12 w-12 object-contain"
              />
            </div>

            <div>
              <h3 className="font-semibold">St. Lorenzo Ruiz Parish</h3>

              <p className="text-sm text-gray-500">0912 345 6789</p>
            </div>
          </div>

          <div className="flex justify-center">
            <img
              //src="/images/gcash-qr.png"
              src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=GCASH-QR-PLACEHOLDER"
              alt="GCash QR Code"
              className="h-64 w-64 rounded-2xl border bg-white p-2 object-contain"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              GCash Reference Number <span className="text-red-600">*</span>
            </label>

            <input
              type="text"
              value={booking.reference_number}
              onChange={(e) => updateBooking("reference_number", e.target.value)}
              readOnly={readOnly}
              placeholder="Enter GCash Reference Number"
              className={
                inputClass +
                (getError("reference_number") ? " border-red-400" : "")
              }
            />
            <FieldError message={getError("reference_number")} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Payment Receipt <span className="text-red-600">*</span>
            </label>
            <FieldError message={getError("receipt")} />

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-300 bg-red-50 px-6 py-10 transition hover:border-[#B22222] hover:bg-red-100">
              <UploadCloud size={48} className="mb-3 text-[#B22222]" />

              <p className="font-semibold">Upload GCash Receipt</p>

              <p className="mt-1 text-sm text-gray-500">
                PDF, JPG, JPEG or PNG (Max 5 MB)
              </p>

              {booking.receipt && (
                <p className="mt-4 text-sm font-medium text-green-600">
                  {booking.receipt.name}
                </p>
              )}

              <input
                hidden
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  updateBooking("receipt", e.target.files?.[0] ?? null)
                }
              />
            </label>
          </div>
        </div>
      </BookingCard>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-sm text-red-600">{message}</p>
  ) : null;
}
