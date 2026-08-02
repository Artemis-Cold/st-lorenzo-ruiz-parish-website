import { CheckCircle2, CircleX, FileText } from "lucide-react";

import { BookingCard } from "../..";
import type { WeddingBooking } from "../../../../types/wedding";

interface RequirementsSummaryProps {
  booking: WeddingBooking;
}

export default function RequirementsSummary({
  booking,
}: RequirementsSummaryProps) {
  const requirements = [
    {
      label: "Marriage License",
      file: booking.requirements.marriageLicense,
    },
    {
      label: "Certificate of No Marriage (CENOMAR)",
      file: booking.requirements.cenomar,
    },
    {
      label: "Baptismal Certificate",
      file: booking.requirements.baptismalCertificate,
    },
    {
      label: "Confirmation Certificate",
      file: booking.requirements.confirmationCertificate,
    },
    {
      label: "3R Couple Photo",
      file: booking.requirements.couplePhoto,
    },
    {
      label: "Sponsor Marriage Contract",
      file: booking.requirements.sponsorMarriageContract,
    },
    {
      label: "Sponsor Confirmation Certificate",
      file: booking.requirements.sponsorConfirmationCertificate,
    },
  ];

  return (
    <BookingCard title="Submitted Requirements">
      <div className="space-y-4">
        {requirements.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-4">
              <FileText size={22} className="text-[#B22222]" />

              <div>
                <p className="font-medium">{item.label}</p>

                <p className="text-sm text-gray-500">
                  {item.file?.name ?? "Not uploaded"}
                </p>
              </div>
            </div>

            {item.file ? (
              <span className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                <CheckCircle2 size={16} />
                Uploaded
              </span>
            ) : (
              <span className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                <CircleX size={16} />
                Missing
              </span>
            )}
          </div>
        ))}
      </div>
    </BookingCard>
  );
}
