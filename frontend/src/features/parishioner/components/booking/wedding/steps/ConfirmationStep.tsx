import ReviewSection, { ReviewDetails } from "../../ReviewSection";
import PreparationCost from "../summary/PreparationCost";
import { BookingTranslation } from "@/features/parishioner/components/booking/BookingLabel";
import BookingLabel from "@/features/parishioner/components/booking/BookingLabel";
import ConfirmationNotice from "../summary/ConfirmationNotice";
import ScheduleSummary from "../summary/ScheduleSummary";
import PackageSummary from "../summary/PackageSummary";

import type { Dispatch, SetStateAction } from "react";
import type { WeddingBooking } from "../../../../types/wedding";
import type { BookingSlot } from "../../../../../../services/bookingSlotService";
import type { ServicePackage } from "../../../../../../services/servicePackageService";

interface ConfirmationStepProps {
  booking: WeddingBooking;
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
          selectedAddonIds={booking.selected_addon_ids}
        />
      </ReviewSection>

      {(["bride", "groom"] as const).map((role) => {
        const person = Object.fromEntries(
          Object.entries(booking.applicant[role]).filter(
            ([key]) => key !== "church" && key !== "preparations",
          ),
        );
        return (
          <ReviewSection
            key={role}
            title={role === "bride" ? "Bride" : "Groom"}
            onEdit={() => onEdit(role === "bride" ? 4 : 5)}
            data={person}
          />
        );
      })}
      <ReviewSection
        title="Sponsors"
        onEdit={() => onEdit(6)}
        data={booking.sponsors.map(({ requirement_file, ...person }) => ({
          ...person,
          documents:
            requirement_file?.name ??
            "Upload after schedule confirmation / I-upload matapos makumpirma ang iskedyul",
        }))}
      />
      <ReviewSection title="Baptism & Confirmation" onEdit={() => onEdit(7)}>
        {(["bride", "groom"] as const).map((role) => {
          const person = booking.applicant[role];
          return (
            <div key={role} className="mb-5">
              <h4 className="mb-3 font-semibold">
                {role === "bride" ? "Bride / Nobya" : "Groom / Nobyo"}
              </h4>
              <ReviewDetails
                data={{
                  baptism_status: person.church.baptism_status,
                  baptized_in:
                    person.church.baptism_status === "yes"
                      ? person.church.baptized_in
                      : "Not applicable / Hindi naaangkop",
                  confirmation_status: person.church.confirmation_status,
                  confirmed_in:
                    person.church.confirmation_status === "yes"
                      ? person.church.confirmed_in
                      : "Not applicable / Hindi naaangkop",
                }}
              />
              {(["baptism", "confirmation"] as const).map(
                (code) =>
                  person.church[
                    code === "baptism"
                      ? "baptism_status"
                      : "confirmation_status"
                  ] === "no" && (
                    <div key={code} className="mt-4 rounded-xl bg-gray-50 p-4">
                      <h5 className="mb-3 font-semibold">
                        {code === "baptism"
                          ? "Baptism / Binyag"
                          : "Confirmation / Kumpil"}
                      </h5>
                      <PreparationCost
                        code={code}
                        sponsors={booking.sponsors.length}
                      />
                      <ReviewDetails
                        data={
                          person.preparations?.[code]
                            ? {
                                candidate: {
                                  ...person.preparations[code]?.candidate,
                                  ...(code === "confirmation" &&
                                  person.church.baptism_status === "no"
                                    ? {
                                        baptism_date:
                                          "To follow after baptism / Pagkatapos ng binyag",
                                        baptism_church:
                                          "To follow after baptism / Pagkatapos ng binyag",
                                      }
                                    : {}),
                                },
                                parents: person.preparations[code]?.parents,
                                sponsors:
                                  "Same as wedding sponsors / Mga sponsor sa kasal",
                                schedule:
                                  "To be announced by the parish / Ipapahayag ng parokya",
                                requirements:
                                  "Upload after schedule confirmation / I-upload matapos makumpirma ang iskedyul",
                              }
                            : "Not provided / Hindi ibinigay"
                        }
                      />
                    </div>
                  ),
              )}
            </div>
          );
        })}
      </ReviewSection>

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
