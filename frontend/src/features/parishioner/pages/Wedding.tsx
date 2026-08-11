import { useState, useEffect } from "react";

import DashboardLayout from "../components/DashboardLayout";

import {
  BookingHeader,
  BookingStepper,
  BookingFooter,
} from "../components/booking";

import AlertBanner from "../components/booking/AlertBanner";

import RequirementsStep from "../components/booking/wedding/steps/RequirementsStep";
import ScheduleStep from "../components/booking/wedding/steps/ScheduleStep";
import PackagesStep from "../components/booking/wedding/steps/PackagesStep";
import DetailsStep from "../components/booking/wedding/steps/DetailsStep";
import ConfirmationStep from "../components/booking/wedding/steps/ConfirmationStep";
import type { BookingSlot } from "@/services/bookingSlotService";
import type { ServicePackage } from "@/services/servicePackageService";
import { submitWeddingBooking } from "@/services/weddingBookingService";

import type { WeddingBooking, Person } from "../types/wedding";

const stepLabels = [
  "Requirements",
  "Schedule",
  "Packages",
  "Details",
  "Confirmation",
];

const emptyPerson = (): Person => ({
  first_name: "",
  middle_initial: "",
  last_name: "",

  address: "",
  age: null,
  contact_number: "",

  church: {
    baptized_in: "",
    confirmed_in: "",
  },

  father: {
    first_name: "",
    middle_initial: "",
    last_name: "",
  },

  mother: {
    first_name: "",
    middle_initial: "",
    last_name: "",
  },

  previous_church_marriage: {
    church_name: "",
    priest: "",
    church_address: "",
  },
});

export default function Wedding() {
  const [booking, setBooking] = useState<WeddingBooking>({
    booking_slot_id: 0,

    service_package_id: 0,

    selected_addon_ids: [],

    applicant: {
      groom: emptyPerson(),
      bride: emptyPerson(),
    },

    documents: [],

    remarks: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [selectedPackage, setSelectedPackage] =
    useState<ServicePackage | null>(null);

  const [stepError, setStepError] = useState<string | null>(null);
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
    currentBooking: WeddingBooking,
  ): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};

    const addError = (key: string, message: string) => {
      errors[key] = [...(errors[key] ?? []), message];
    };

    const requireField = (
      key: string,
      value: string | number | null | undefined,
      label: string,
    ) => {
      if (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
      ) {
        addError(key, `${label} is required.`);
      }
    };

    (["groom", "bride"] as const).forEach((applicantType) => {
      const person = currentBooking.applicant[applicantType];
      const personLabel = applicantType === "groom" ? "Groom" : "Bride";
      const prefix = `applicant.${applicantType}`;

      requireField(
        `${prefix}.last_name`,
        person.last_name,
        `${personLabel}'s last name`,
      );
      requireField(
        `${prefix}.first_name`,
        person.first_name,
        `${personLabel}'s first name`,
      );
      requireField(
        `${prefix}.address`,
        person.address,
        `${personLabel}'s address`,
      );
      requireField(`${prefix}.age`, person.age, `${personLabel}'s age`);
      requireField(
        `${prefix}.contact_number`,
        person.contact_number,
        `${personLabel}'s contact number`,
      );
      requireField(
        `${prefix}.church.baptized_in`,
        person.church.baptized_in,
        `${personLabel}'s baptism parish`,
      );
      requireField(
        `${prefix}.church.confirmed_in`,
        person.church.confirmed_in,
        `${personLabel}'s confirmation parish`,
      );

      (["father", "mother"] as const).forEach((parent) => {
        const parentLabel = parent === "father" ? "father" : "mother";
        requireField(
          `${prefix}.${parent}.last_name`,
          person[parent].last_name,
          `${personLabel}'s ${parentLabel}'s last name`,
        );
        requireField(
          `${prefix}.${parent}.first_name`,
          person[parent].first_name,
          `${personLabel}'s ${parentLabel}'s first name`,
        );
      });

      requireField(
        `${prefix}.previous_church_marriage.church_name`,
        person.previous_church_marriage.church_name,
        `${personLabel}'s parish name`,
      );
      requireField(
        `${prefix}.previous_church_marriage.priest`,
        person.previous_church_marriage.priest,
        `${personLabel}'s parish priest`,
      );
      requireField(
        `${prefix}.previous_church_marriage.church_address`,
        person.previous_church_marriage.church_address,
        `${personLabel}'s parish address`,
      );

      if (person.age !== null && person.age < 0) {
        addError(`${prefix}.age`, `${personLabel}'s age cannot be negative.`);
      }

      if (
        person.contact_number.trim() !== "" &&
        !/^09\d{9}$/.test(person.contact_number.replace(/\s+/g, ""))
      ) {
        addError(
          `${prefix}.contact_number`,
          `${personLabel}'s contact number must be a valid 11-digit mobile number.`,
        );
      }
    });

    const requiredDocuments = [
      ["marriage_license", "Marriage License"],
      ["cenomar", "Certificate of No Marriage (CENOMAR)"],
      ["baptismal_certificate", "Baptismal Certificate"],
      ["confirmation_certificate", "Confirmation Certificate"],
      ["couple_photo", "Couple Photo"],
    ] as const;

    currentBooking.documents.forEach((document) => {
      if (document.file.size > 5 * 1024 * 1024) {
        addError(
          `documents.${document.document_type}`,
          `${document.file.name} must not exceed 5 MB.`,
        );
      }
    });

    requiredDocuments.forEach(([documentType, label]) => {
      if (
        !currentBooking.documents.some(
          (document) => document.document_type === documentType,
        )
      ) {
        addError(`documents.${documentType}`, `${label} is required.`);
      }
    });

    const hasSponsorDocument = currentBooking.documents.some(
      (document) =>
        document.document_type === "sponsor_marriage_contract" ||
        document.document_type === "sponsor_confirmation_certificate",
    );

    if (!hasSponsorDocument) {
      addError(
        "documents.sponsor",
        "Upload either the sponsors' Marriage Contract or Confirmation Certificate.",
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
      await submitWeddingBooking(booking);
      setSubmitted(true);
    } catch (error: unknown) {
      const submissionError = error as {
        validationErrors?: Record<string, string[]>;
      };

      if (submissionError.validationErrors) {
        setFieldErrors(submissionError.validationErrors);
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
          title="Wedding"
          subtitle="Schedule your Sacrament of Holy Matrimony"
        />

        <BookingStepper currentStep={currentStep} steps={stepLabels} />

        {submitted ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800">
            Your wedding booking has been submitted. We'll notify you once it's
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
