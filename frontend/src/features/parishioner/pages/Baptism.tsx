import { useState, useEffect } from "react";

import DashboardLayout from "../components/DashboardLayout";
import AlertBanner from "../components/booking/AlertBanner";
import {
  BookingHeader,
  BookingStepper,
  BookingFooter,
} from "../components/booking";

import RequirementsStep from "../components/booking/baptism/steps/RequirementsStep";
import ScheduleStep from "../components/booking/baptism/steps/ScheduleStep";
import PackagesStep from "../components/booking/baptism/steps/PackagesStep";
import DetailsStep from "../components/booking/baptism/steps/DetailsStep";
import ConfirmationStep from "../components/booking/baptism/steps/ConfirmationStep";

import { submitBooking } from "../../../services/baptismBookingService";

import type { BaptismBooking } from "../types/baptism";
import type { BookingSlot } from "../../../services/bookingSlotService";
import type { ServicePackage } from "../../../services/servicePackageService";

const stepLabels = [
  "Requirements",
  "Schedule",
  "Packages",
  "Details",
  "Confirmation",
];

export default function Baptism() {
  const [booking, setBooking] = useState<BaptismBooking>({
    booking_slot_id: 0,
    service_package_id: 0,

    seminar_date: null,

    baptizand: {
      first_name: "",
      middle_initial: "",
      last_name: "",

      birth_date: null,
      birth_place: "",

      age: null,

      gender: "",

      address: "",

      contact_number: "",
    },

    parents: [
      {
        relationship: "father",
        first_name: "",
        middle_initial: "",
        last_name: "",
        birth_place: "",
      },
      {
        relationship: "mother",
        first_name: "",
        middle_initial: "",
        last_name: "",
        birth_place: "",
      },
    ],

    god_parents: [
      {
        god_father: {
          role: "godfather",
          first_name: "",
          middle_initial: "",
          last_name: "",
          residence: "",
        },
        god_mother: {
          role: "godmother",
          first_name: "",
          middle_initial: "",
          last_name: "",
          residence: "",
        },
        requirements: {
          marriage_contract: null,
          confirmation_certificate: null,
        },
      },
    ],

    documents: [],

    remarks: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date | null>(
    null,
  );
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [agreedToDeclaration, setAgreedToDeclaration] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentStep]);

  useEffect(() => {
    if (stepError || submitError) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [stepError, submitError]);

  const pages = [
    <RequirementsStep key="requirements" />,
    <ScheduleStep
      booking={booking}
      setBooking={setBooking}
      selectedDate={selectedScheduleDate}
      setSelectedDate={setSelectedScheduleDate}
      selectedSlot={selectedSlot}
      setSelectedSlot={setSelectedSlot}
      key="schedule"
    />,
    <PackagesStep
      booking={booking}
      setBooking={setBooking}
      selectedDate={selectedScheduleDate}
      selectedPackage={selectedPackage}
      setSelectedPackage={setSelectedPackage}
      key="packages"
    />,
    <DetailsStep
      key="details"
      booking={booking}
      setBooking={setBooking}
      errors={fieldErrors}
    />,
    <ConfirmationStep
      booking={booking}
      setBooking={setBooking}
      selectedDate={selectedScheduleDate}
      selectedSlot={selectedSlot}
      selectedPackage={selectedPackage}
      agree={agreedToDeclaration}
      setAgree={setAgreedToDeclaration}
      key="confirmation"
    />,
  ];

  const validateDetailsStep = (
    booking: BaptismBooking,
  ): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};

    const addError = (key: string, message: string) => {
      errors[key] = [...(errors[key] ?? []), message];
    };

    const requireField = (
      key: string,
      value: string | number | Date | null | undefined,
      label = "This field",
    ) => {
      if (value === null || value === undefined || value === "") {
        addError(key, `${label} is required.`);
      }
    };

    const validateIf = (
      key: string,
      value: string | number | Date | null | undefined,
      condition: boolean,
      message: string,
    ) => {
      // only runs the custom check if the field actually has a value —
      // requireField already handles the "empty" case separately
      if (value !== null && value !== undefined && value !== "" && condition) {
        addError(key, message);
      }
    };

    // Baptizand
    requireField(
      "baptizand.first_name",
      booking.baptizand.first_name,
      "First name",
    );
    requireField(
      "baptizand.last_name",
      booking.baptizand.last_name,
      "Last name",
    );
    requireField("baptizand.gender", booking.baptizand.gender, "Gender");
    requireField(
      "baptizand.birth_date",
      booking.baptizand.birth_date,
      "Birthday",
    );
    requireField(
      "baptizand.birth_place",
      booking.baptizand.birth_place,
      "Place of birth",
    );
    requireField("baptizand.age", booking.baptizand.age, "Age");
    requireField("baptizand.address", booking.baptizand.address, "Address");
    requireField(
      "baptizand.contact_number",
      booking.baptizand.contact_number,
      "Contact number",
    );

    requireField("seminar_date", booking.seminar_date, "Seminar Date");

    validateIf(
      "baptizand.age",
      booking.baptizand.age,
      booking.baptizand.age !== null && booking.baptizand.age < 0,
      "Age cannot be negative.",
    );

    validateIf(
      "baptizand.birth_date",
      booking.baptizand.birth_date,
      booking.baptizand.birth_date !== null &&
        booking.baptizand.birth_date > new Date(),
      "Birthday cannot be in the future.",
    );

    validateIf(
      "baptizand.contact_number",
      booking.baptizand.contact_number,
      !/^09\d{9}$/.test(
        (booking.baptizand.contact_number ?? "").replace(/\s+/g, ""),
      ),
      "Enter a valid 11-digit mobile number (e.g. 09171234567).",
    );

    validateIf(
      "seminar_date",
      booking.seminar_date,
      booking.seminar_date !== null && booking.seminar_date < new Date(),
      "Seminar date cannot be in the past.",
    );

    // Parents
    booking.parents.forEach((parent, i) => {
      requireField(`parents.${i}.first_name`, parent.first_name, "First name");
      requireField(`parents.${i}.last_name`, parent.last_name, "Last name");
      requireField(
        `parents.${i}.birth_place`,
        parent.birth_place,
        "Place of birth",
      );
    });

    // Godparents
    booking.god_parents.forEach((pair, i) => {
      requireField(
        `god_parents.${i}.god_father.first_name`,
        pair.god_father.first_name,
        "First name",
      );
      requireField(
        `god_parents.${i}.god_father.last_name`,
        pair.god_father.last_name,
        "Last name",
      );
      requireField(
        `god_parents.${i}.god_father.residence`,
        pair.god_father.residence,
        "Residence",
      );

      requireField(
        `god_parents.${i}.god_mother.first_name`,
        pair.god_mother.first_name,
        "First name",
      );
      requireField(
        `god_parents.${i}.god_mother.last_name`,
        pair.god_mother.last_name,
        "Last name",
      );
      requireField(
        `god_parents.${i}.god_mother.residence`,
        pair.god_mother.residence,
        "Residence",
      );

      const hasMarriageContract = pair.requirements.marriage_contract !== null;
      const hasConfirmationCert =
        pair.requirements.confirmation_certificate !== null;

      if (!hasMarriageContract && !hasConfirmationCert) {
        addError(
          `god_parents.${i}.requirements.marriage_contract`,
          "Upload either a Marriage Contract or Confirmation Certificate.",
        );
      }
    });

    // Documents
    const hasBirthCertificate = booking.documents.some(
      (d) => d.document_type === "birth_certificate",
    );

    if (!hasBirthCertificate) {
      addError("documents.birth_certificate", "Birth certificate is required.");
    }
    const isAdultBaptism =
      booking.baptizand.age !== null && booking.baptizand.age >= 7;

    const hasNoRecordCertificate = booking.documents.some(
      (d) => d.document_type === "no_record_certificate",
    );

    if (isAdultBaptism && !hasNoRecordCertificate) {
      addError(
        "documents.no_record_certificate",
        "Certificate of No Record of Baptism is required for baptizands 7 years old and above.",
      );
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
      const detailsErrors = validateDetailsStep(booking);

      if (Object.keys(detailsErrors).length > 0) {
        setFieldErrors(detailsErrors);
        return "Please complete all required fields before continuing.";
      }

      setFieldErrors({});
    }
    
    if (step === 5 && !agreedToDeclaration) {
      return "Please agree to the declaration before submitting.";
    }

    return null;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    try {
      await submitBooking(booking);
      setSubmitted(true);
    } catch (err: any) {
      if (err?.validationErrors) {
        setFieldErrors(err.validationErrors);
        setSubmitError("Please review the highlighted fields and try again.");
      } else {
        setSubmitError(
          "Something went wrong submitting your booking. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    const error = validateStep(currentStep);

    if (error) {
      setStepError(error);
      return;
    }

    setStepError(null);

    if (currentStep < pages.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BookingHeader
          title="Baptism"
          subtitle="Arrange the Celebration of the Sacrament of Baptism"
        />

        <BookingStepper currentStep={currentStep} steps={stepLabels} />

        {submitted ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800">
            Your baptism booking has been submitted. We'll notify you once it's
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
                  ? () => setCurrentStep((prev) => prev - 1)
                  : undefined
              }
              next={handleNext}
              previousText="Back"
              nextText={
                currentStep === pages.length
                  ? submitting
                    ? "Submitting..."
                    : "Submit Booking"
                  : `Continue to ${stepLabels[currentStep]}`
              }
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
