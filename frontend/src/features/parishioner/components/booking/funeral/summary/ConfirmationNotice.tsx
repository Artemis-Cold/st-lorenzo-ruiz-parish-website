import { ShieldCheck } from "lucide-react";

import { BookingCard } from "../..";

export default function ConfirmationNotice() {
  return (
    <BookingCard title="Review & Confirmation">
      <div className="flex items-start gap-4 rounded-2xl border border-green-300 bg-green-50 p-5">
        <ShieldCheck className="mt-1 text-green-600" size={28} />

        <div>
          <h3 className="font-semibold text-green-800">
            Review your booking request
          </h3>

          <p className="mt-2 text-sm text-green-700">
            Please verify all information before submitting. Once submitted,
            your request will be reviewed by the parish office.
          </p>
        </div>
      </div>
    </BookingCard>
  );
}
