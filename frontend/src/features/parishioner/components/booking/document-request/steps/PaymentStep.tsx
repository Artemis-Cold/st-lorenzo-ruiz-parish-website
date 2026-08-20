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
      <BookingCard title="GCash Payment" contentClassName="p-5 sm:p-6 lg:p-5 xl:p-6">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-center">
            <div className="flex justify-center rounded-2xl bg-gray-50 p-2 lg:p-1">
            <img
              //src="/images/gcash-qr.png"
              src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=GCASH-QR-PLACEHOLDER"
              alt="GCash QR Code"
                className="size-52 rounded-xl border bg-white p-2 object-contain lg:size-40 xl:size-44"
            />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border p-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-50">
                  <img src={gcashLogo} alt="GCash" className="size-9 object-contain" />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold sm:text-base">St. Lorenzo Ruiz Parish</h3>
                  <p className="text-sm text-gray-500">0912 345 6789</p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  GCash Reference Number <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.reference_number}
                  onChange={(e) => updateBooking("reference_number", e.target.value)}
                  readOnly={readOnly}
                  placeholder="Enter GCash Reference Number"
                  className={inputClass + (getError("reference_number") ? " border-red-400" : "")}
                />
                <FieldError message={getError("reference_number")} />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Payment Receipt <span className="text-red-600">*</span>
            </label>
            <FieldError message={getError("receipt")} />

            <label className="flex min-w-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-red-300 bg-red-50 px-4 py-7 text-center transition hover:border-[#B22222] hover:bg-red-100 sm:px-6 lg:flex-row lg:justify-start lg:gap-4 lg:px-5 lg:py-4 lg:text-left">
              <UploadCloud className="mb-3 size-10 shrink-0 text-[#B22222] lg:mb-0 lg:size-8" />

              <div className="min-w-0">
                <p className="font-semibold">Upload GCash Receipt</p>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">PDF, JPG, JPEG or PNG (Max 5 MB)</p>
                {booking.receipt && <p className="mt-2 max-w-full break-all text-sm font-medium text-green-600 lg:mt-1">{booking.receipt.name}</p>}
              </div>

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
