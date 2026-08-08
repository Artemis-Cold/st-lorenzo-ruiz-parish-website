import ConfirmationNotice from "../summary/ConfirmationNotice";
import ScheduleSummary from "../summary/ScheduleSummary";
import PackageSummary from "../summary/PackageSummary";

import DetailsStep from "./DetailsStep";

import type { Dispatch, SetStateAction } from "react";
import type { BaptismBooking } from "../../../../types/baptism";
import type { BookingSlot } from "../../../../../../services/bookingSlotService";
import type { ServicePackage } from "../../../../../../services/servicePackageService";

interface ConfirmationStepProps {
  booking: BaptismBooking;
  setBooking: Dispatch<SetStateAction<BaptismBooking>>;
  selectedDate: Date | null;
  selectedSlot: BookingSlot | null;
  selectedPackage: ServicePackage | null;
  agree: boolean;
  setAgree: Dispatch<SetStateAction<boolean>>;
}

export default function ConfirmationStep({
  booking,
  setBooking,
  selectedDate,
  selectedSlot,
  selectedPackage,
  agree,
  setAgree,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-8">
      <ConfirmationNotice />

      <ScheduleSummary selectedDate={selectedDate} selectedSlot={selectedSlot} />

      <PackageSummary selectedPackage={selectedPackage} />

      <DetailsStep booking={booking} setBooking={setBooking} readOnly />

      <div className="rounded-3xl border border-[#B22222]/20 bg-red-50 p-6">
        <h3 className="mb-4 text-xl font-bold text-[#B22222]">Declaration</h3>

        <p className="mb-6 text-gray-700">
          I hereby certify that all information and uploaded documents provided
          in this booking request are true, complete, and accurate. I understand
          that submitting false, incomplete, or misleading information may
          result in the rejection or cancellation of my booking request.
        </p>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
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
        </label>
      </div>
    </div>
  );
}