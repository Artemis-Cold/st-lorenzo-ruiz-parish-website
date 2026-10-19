import ReviewSection from "../../ReviewSection";
import { BookingTranslation } from "@/features/parishioner/components/booking/BookingLabel";
import BookingLabel from "@/features/parishioner/components/booking/BookingLabel";
import ConfirmationNotice from "../summary/ConfirmationNotice";
import ScheduleSummary from "../summary/ScheduleSummary";
import PackageSummary from "../summary/PackageSummary";

import type { Dispatch, SetStateAction } from "react";
import type { BaptismBooking } from "../../../../types/baptism";
import type { BookingSlot } from "../../../../../../services/bookingSlotService";
import type { ServicePackage } from "../../../../../../services/servicePackageService";

interface ConfirmationStepProps {
  booking: BaptismBooking;
  onEdit: (step: number) => void;
  selectedDate: Date | null;
  selectedSlot: BookingSlot | null;
  selectedPackage: ServicePackage | null;
  additionalSponsorPrice: number | null;
  agree: boolean;
  setAgree: Dispatch<SetStateAction<boolean>>;
}

export default function ConfirmationStep({
  booking,
  onEdit,
  selectedDate,
  selectedSlot,
  selectedPackage,
  additionalSponsorPrice,
  agree,
  setAgree,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-8">
      <ConfirmationNotice />

      <ReviewSection title="Schedule" onEdit={() => onEdit(2)}>
        <ScheduleSummary
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
        />
      </ReviewSection>

      <ReviewSection title="Package & Fees" onEdit={() => onEdit(3)}>
        <PackageSummary
          selectedPackage={selectedPackage}
          additionalSponsorCount={Math.max(booking.god_parents.length - 2, 0)}
          additionalSponsorPrice={additionalSponsorPrice}
        />
      </ReviewSection>

      <ReviewSection
        title="Baptizand & Parents"
        onEdit={() => onEdit(4)}
        data={{ baptizand: booking.baptizand, parents: booking.parents }}
      />
      <ReviewSection
        title="Godparents"
        onEdit={() => onEdit(5)}
        data={booking.god_parents.map(({ requirement_file, ...person }) => ({
          ...person,
          documents:
            requirement_file?.name ??
            "Upload after schedule confirmation / I-upload matapos makumpirma ang iskedyul",
        }))}
      />

      <div className="rounded-3xl border border-[#B22222]/20 bg-red-50 p-6">
        <h3 className="mb-4 text-xl font-bold text-[#B22222]">
          Declaration
          <BookingTranslation text="Declaration" />
        </h3>

        <p className="mb-6 text-gray-700">
          I hereby certify that all information provided in this booking request
          are true, complete, and accurate. I understand that submitting false,
          incomplete, or misleading information may result in the rejection or
          cancellation of my booking request.
        </p>

        <BookingLabel className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 h-5 w-5 accent-[#B22222]"
          />

          <span className="text-sm text-gray-700">
            I have reviewed all the information above and I agree to the
            parish's booking policies and requirements.
          </span>
        </BookingLabel>
      </div>
    </div>
  );
}
