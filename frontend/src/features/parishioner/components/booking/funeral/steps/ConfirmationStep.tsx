import ReviewSection from "../../ReviewSection";
import { useAuth } from "@/contexts/AuthContext";
import { BookingTranslation } from "@/features/parishioner/components/booking/BookingLabel";
import BookingLabel from "@/features/parishioner/components/booking/BookingLabel";
import ConfirmationNotice from "../summary/ConfirmationNotice";
import ScheduleSummary from "../summary/ScheduleSummary";
import PackageSummary from "../summary/PackageSummary";

import type { Dispatch, SetStateAction } from "react";
import type { FuneralBooking } from "../../../../types/funeral";
import type { BookingSlot } from "../../../../../../services/bookingSlotService";
import type { ServicePackage } from "../../../../../../services/servicePackageService";

interface ConfirmationStepProps {
  booking: FuneralBooking;
  onEdit: (step: number) => void;
  selectedDate: Date | null;
  selectedSlot: BookingSlot | null;
  selectedPackage: ServicePackage | null;
  agree: boolean;
  setAgree: Dispatch<SetStateAction<boolean>>;
}

export default function ConfirmationStep({
  booking,
  onEdit,
  selectedDate,
  selectedSlot,
  selectedPackage,
  agree,
  setAgree,
}: ConfirmationStepProps) {
  const { user } = useAuth();
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
        <PackageSummary selectedPackage={selectedPackage} />
      </ReviewSection>

      <ReviewSection
        title="Deceased & Family"
        onEdit={() => onEdit(4)}
        data={{
          first_name: booking.deceased.first_name,
          middle_initial: booking.deceased.middle_initial,
          last_name: booking.deceased.last_name,
          address: booking.deceased.address,
          birth_date: booking.deceased.birth_date,
          death_cause: booking.deceased.death_cause,
          father: booking.deceased.father,
          mother: booking.deceased.mother,
          has_spouse: booking.deceased.has_spouse,
          spouse: booking.deceased.has_spouse
            ? booking.deceased.spouse
            : "Not applicable / Hindi naaangkop",
          children: booking.deceased.children,
        }}
      />
      <ReviewSection
        title="Faith & Character"
        onEdit={() => onEdit(5)}
        data={{
          sacraments: booking.deceased.sacraments,
          church_life: booking.deceased.church_life,
          characteristics: booking.deceased.characteristics,
        }}
      />
      <ReviewSection
        title="Informant"
        onEdit={() => onEdit(6)}
        data={{
          name: user?.full_name,
          contact_number: user?.phone,
          ...booking.deceased.informant,
        }}
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
