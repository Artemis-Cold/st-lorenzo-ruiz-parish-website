import { CheckCircle2, CircleX, FileText } from "lucide-react";
import { BookingCard } from "../..";
import type { FuneralBooking } from "../../../../types/funeral";

export default function RequirementsSummary({
  booking,
}: {
  booking: FuneralBooking;
}) {
  const requirements = [
    ["Death Certificate", "death_certificate"],
    ["Biography of the Deceased", "biography"],
  ] as const;

  return (
    <BookingCard title="Submitted Requirements">
      <div className="space-y-4">
        {requirements.map(([label, type]) => {
          const file = booking.documents.find(
            (document) => document.document_type === type,
          )?.file;
          return (
            <div
              key={type}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-4">
                <FileText size={22} className="text-[#B22222]" />
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-gray-500">
                    {file?.name ?? "Not uploaded"}
                  </p>
                </div>
              </div>
              {file ? (
                <span className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                  <CheckCircle2 size={16} /> Uploaded
                </span>
              ) : (
                <span className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                  <CircleX size={16} /> Missing
                </span>
              )}
            </div>
          );
        })}
      </div>
    </BookingCard>
  );
}
