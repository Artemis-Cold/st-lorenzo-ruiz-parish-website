import ReviewSection from "../../ReviewSection";
import { useAuth } from "@/contexts/AuthContext";
import { BookingTranslation } from "@/features/parishioner/components/booking/BookingLabel";
import BookingLabel from "@/features/parishioner/components/booking/BookingLabel";

import type { DocumentRequestBooking } from "../../../../types/document";
import { formatPhpCurrency } from "@/utils/currency";

import type { Dispatch, SetStateAction } from "react";

interface ConfirmationStepProps {
  booking: DocumentRequestBooking;
  agree: boolean;
  onEdit: (step: number) => void;
  setAgree: Dispatch<SetStateAction<boolean>>;
}

export default function ConfirmationStep({
  booking,
  onEdit,
  agree,
  setAgree,
}: ConfirmationStepProps) {
  const { user } = useAuth();
  const total = booking.requests.reduce(
    (sum, request) => sum + request.price,
    0,
  );

  return (
    <div className="space-y-6">
      <ReviewSection
        title="Requester"
        data={{
          name: user?.full_name,
          contact_number: user?.phone,
          address: user?.address,
        }}
      />
      <ReviewSection
        title="Document Selection"
        onEdit={() => onEdit(1)}
        data={{
          documents: booking.requests.map((request) => ({
            document_type: request.document_type,
            fee: formatPhpCurrency(request.price),
          })),
          total: formatPhpCurrency(total),
        }}
      />
      {booking.requests.map((request, index) => (
        <ReviewSection
          key={request.id}
          title={"Document " + (index + 1) + ": " + request.document_type}
          onEdit={() => onEdit(2)}
          data={request.details}
        />
      ))}
      <ReviewSection
        title="Payment Information"
        onEdit={() => onEdit(3)}
        data={{
          payment_method:
            total === 0 ? "Not applicable — Free / Walang bayad" : "GCash",
          total: formatPhpCurrency(total),
          ...(total > 0
            ? {
                reference_number: booking.reference_number,
                receipt:
                  booking.receipt?.name ?? "Not provided / Hindi ibinigay",
              }
            : {}),
          remarks: booking.remarks,
        }}
      />
      <div className="rounded-3xl border border-[#B22222]/20 bg-red-50 p-6">
        <h3 className="mb-4 text-xl font-bold text-[#B22222]">
          Declaration
          <BookingTranslation text="Declaration" />
        </h3>
        <p className="mb-6 text-gray-700">
          I certify that I am the registered account holder and official
          claimant, and that the record-owner relationship and payment details
          provided are true and accurate.
        </p>
        <BookingLabel className="flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4">
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
        </BookingLabel>
      </div>
    </div>
  );
}
