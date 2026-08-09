import { useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import {
  BookingFooter,
  BookingHeader,
  BookingStepper,
} from "../components/booking";
import AlertBanner from "../components/booking/AlertBanner";
import RequirementsStep from "../components/booking/funeral/steps/RequirementsStep";
import ScheduleStep from "../components/booking/funeral/steps/ScheduleStep";
import PackagesStep from "../components/booking/funeral/steps/PackagesStep";
import DetailsStep from "../components/booking/funeral/steps/DetailsStep";
import ConfirmationStep from "../components/booking/funeral/steps/ConfirmationStep";
import type { FuneralBooking } from "../types/funeral";
import type { BookingSlot } from "@/services/bookingSlotService";
import type { ServicePackage } from "@/services/servicePackageService";
import { submitFuneralBooking } from "@/services/funeralBookingService";

const stepLabels = [
  "Requirements",
  "Schedule",
  "Packages",
  "Details",
  "Confirmation",
];

const emptyName = () => ({
  first_name: "",
  middle_initial: "",
  last_name: "",
});

export default function Funeral() {
  const [booking, setBooking] = useState<FuneralBooking>({
    booking_slot_id: 0,
    service_package_id: 0,
    selected_addon_ids: [],
    deceased: {
      ...emptyName(),
      address: "",
      death_cause: "",
      age: null,
      birth_date: null,
      father: emptyName(),
      mother: emptyName(),
      spouse: emptyName(),
      children: [],
      sacraments: {
        baptized: false,
        confirmed: false,
        church_married: false,
        anointed_of_the_sick: false,
      },
      church_life: {
        attends_mass: "",
        confesses: "",
      },
      characteristics: "",
      informant: {
        ...emptyName(),
        relationship: "",
        contact_number: "",
        date_provided: null,
      },
    },
    documents: [],
    remarks: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [selectedPackage, setSelectedPackage] =
    useState<ServicePackage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const pages = [
    <RequirementsStep key="requirements" />,
    <ScheduleStep
      key="schedule"
      booking={booking}
      setBooking={setBooking}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      selectedSlot={selectedSlot}
      setSelectedSlot={setSelectedSlot}
    />,
    <PackagesStep
      key="packages"
      booking={booking}
      setBooking={setBooking}
      selectedPackage={selectedPackage}
      setSelectedPackage={setSelectedPackage}
    />,
    <DetailsStep
      key="details"
      booking={booking}
      setBooking={setBooking}
      errors={fieldErrors}
    />,
    <ConfirmationStep
      key="confirmation"
      booking={booking}
      setBooking={setBooking}
      selectedDate={selectedDate}
      selectedSlot={selectedSlot}
      selectedPackage={selectedPackage}
      agree={agreed}
      setAgree={setAgreed}
    />,
  ];

  const validateDetails = (): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};
    const required = (key: string, value: unknown, label: string) => {
      if (value === null || value === undefined || value === "") {
        errors[key] = [label + " is required."];
      }
    };
    const deceased = booking.deceased;

    required("deceased.first_name", deceased.first_name, "First name");
    required("deceased.last_name", deceased.last_name, "Last name");
    required("deceased.address", deceased.address, "Address");
    required("deceased.age", deceased.age, "Age");
    required("deceased.birth_date", deceased.birth_date, "Birthday");
    required("deceased.death_cause", deceased.death_cause, "Cause of death");
    for (const parent of ["father", "mother", "spouse"] as const) {
      const parentLabel =
        parent === "father" ? "Father" : parent === "mother" ? "Mother" : "Spouse";
      required(
        "deceased." + parent + ".first_name",
        deceased[parent].first_name,
        parentLabel + "'s first name",
      );
      required(
        "deceased." + parent + ".last_name",
        deceased[parent].last_name,
        parentLabel + "'s last name",
      );
    }
    required(
      "deceased.church_life.attends_mass",
      deceased.church_life.attends_mass,
      "Mass attendance",
    );
    required(
      "deceased.church_life.confesses",
      deceased.church_life.confesses,
      "Frequency of confession",
    );
    required(
      "deceased.characteristics",
      deceased.characteristics,
      "Characteristics of the deceased",
    );
    required(
      "deceased.informant.first_name",
      deceased.informant.first_name,
      "Informant's first name",
    );
    required(
      "deceased.informant.last_name",
      deceased.informant.last_name,
      "Informant's last name",
    );
    required(
      "deceased.informant.relationship",
      deceased.informant.relationship,
      "Relationship",
    );
    required(
      "deceased.informant.contact_number",
      deceased.informant.contact_number,
      "Contact number",
    );
    required(
      "deceased.informant.date_provided",
      deceased.informant.date_provided,
      "Date information provided",
    );

    if (
      deceased.informant.contact_number &&
      !/^09\d{9}$/.test(deceased.informant.contact_number.replace(/\s+/g, ""))
    ) {
      errors["deceased.informant.contact_number"] = [
        "Enter a valid 11-digit mobile number.",
      ];
    }
    if (deceased.age !== null && deceased.age < 0) {
      errors["deceased.age"] = ["Age cannot be negative."];
    }
    if (!booking.documents.some((item) => item.document_type === "death_certificate")) {
      errors["documents.death_certificate"] = ["Death Certificate is required."];
    }
    if (!booking.documents.some((item) => item.document_type === "biography")) {
      errors["documents.biography"] = [
        "Biography of the Deceased is required.",
      ];
    }

    return errors;
  };

  const validateStep = (step: number): string | null => {
    if (step === 2 && booking.booking_slot_id === 0) {
      return "Please select a time slot before continuing.";
    }
    if (step === 3 && booking.service_package_id === 0) {
      return "Please select a package before continuing.";
    }
    if (step === 4) {
      const errors = validateDetails();
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) {
        return "Please complete all required fields before continuing.";
      }
    }
    if (step === 5 && !agreed) {
      return "Please agree to the declaration before submitting.";
    }
    return null;
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitFuneralBooking(booking);
      setSubmitted(true);
    } catch (error: unknown) {
      const failure = error as { validationErrors?: Record<string, string[]> };
      if (failure.validationErrors) {
        setFieldErrors(failure.validationErrors);
        setSubmitError("Please review the highlighted fields and try again.");
      } else {
        setSubmitError("Something went wrong submitting your booking.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    const error = validateStep(currentStep);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    if (currentStep < pages.length) setCurrentStep((value) => value + 1);
    else void submit();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BookingHeader title="Funeral" subtitle="Arrange the Funeral Mass Schedule" />
        <BookingStepper currentStep={currentStep} steps={stepLabels} />
        {submitted ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800">
            Your funeral booking has been submitted. We'll notify you once it is
            reviewed.
          </div>
        ) : (
          <>
            {stepError && <AlertBanner message={stepError} />}
            {submitError && <AlertBanner message={submitError} />}
            {pages[currentStep - 1]}
            <BookingFooter
              previous={
                currentStep > 1
                  ? () => setCurrentStep((value) => value - 1)
                  : undefined
              }
              next={next}
              previousText="Back"
              nextText={
                currentStep === pages.length
                  ? submitting
                    ? "Submitting..."
                    : "Submit Booking"
                  : "Continue to " + stepLabels[currentStep]
              }
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
