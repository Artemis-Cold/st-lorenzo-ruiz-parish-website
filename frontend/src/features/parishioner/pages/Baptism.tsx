import { validationStep } from "../components/booking/validationStep";
import ScheduleApprovalGate from "../components/booking/ScheduleApprovalGate";
import { validationLabel } from "@/utils/validationLabels";
import RequestedSchedule from "../components/booking/RequestedSchedule";
import ConfirmedSchedule from "../components/booking/ConfirmedSchedule";
import { useApprovedSchedule } from "../components/booking/approvedSchedule";
import { useState, useEffect } from "react";

import DashboardLayout from "../components/DashboardLayout";
import AlertBanner from "../components/booking/AlertBanner";
import {
  BookingHeader,
  BookingStepper,
  BookingFooter,
} from "../components/booking";

import RequirementsStep from "../components/booking/baptism/steps/RequirementsStep";
import PackagesStep from "../components/booking/baptism/steps/PackagesStep";
import DetailsStep from "../components/booking/baptism/steps/DetailsStep";
import ConfirmationStep from "../components/booking/baptism/steps/ConfirmationStep";

import { submitBooking } from "../../../services/baptismBookingService";

import type { BaptismBooking, GodParent } from "../types/baptism";
import type { BookingSlot } from "../../../services/bookingSlotService";
import type { ServicePackage } from "../../../services/servicePackageService";
import { getServiceFees } from "@/services/serviceFeeService";

const stepLabels = [
  "Requirements",
  "Schedule",
  "Packages",
  "Baptizand",
  "Godparents",
  "Confirmation",
];

const emptyGodParent = (): GodParent => ({
  role: "",
  first_name: "",
  middle_initial: "",
  last_name: "",
  residence: "",
  requirement_type: "",
  requirement_file: null,
});

export default function Baptism() {
  return (
    <ScheduleApprovalGate serviceCode="baptism" title="Baptism">
      <BaptismForm />
    </ScheduleApprovalGate>
  );
}

function BaptismForm() {
  const approvedSchedule = useApprovedSchedule();
  const [booking, setBooking] = useState<BaptismBooking>({
    booking_slot_id: approvedSchedule?.slot.id ?? 0,
    service_package_id: 0,

    baptizand: {
      first_name: "",
      middle_initial: "",
      last_name: "",

      birth_date: null,
      birth_place: "",

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

    god_parents: [emptyGodParent(), emptyGodParent()],

    documents: [],

    remarks: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date | null>(
    approvedSchedule ? new Date(`${approvedSchedule.date}T00:00:00`) : null,
  );
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(
    approvedSchedule?.slot ?? null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [additionalSponsorPrice, setAdditionalSponsorPrice] = useState<
    number | null
  >(null);

  const [agreedToDeclaration, setAgreedToDeclaration] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;

    getServiceFees("baptism")
      .then((fees) => {
        const sponsorFee = fees.find(
          (fee) => fee.code === "additional_sponsor",
        );
        if (active) setAdditionalSponsorPrice(sponsorFee?.amount ?? null);
      })
      .catch(() => {
        if (active) setAdditionalSponsorPrice(null);
      });

    return () => {
      active = false;
    };
  }, []);

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
    approvedSchedule ? (
      <ConfirmedSchedule key="schedule" />
    ) : (
      <RequestedSchedule
        key="schedule"
        service={"baptism"}
        date={selectedScheduleDate}
        slot={selectedSlot}
        onDateChange={setSelectedScheduleDate}
        onSlotChange={(slot) => {
          setSelectedSlot(slot);
          setBooking((current) => ({
            ...current,
            booking_slot_id: slot?.id ?? 0,
          }));
        }}
      />
    ),
    <PackagesStep
      booking={booking}
      setBooking={setBooking}
      selectedDate={selectedScheduleDate}
      selectedPackage={selectedPackage}
      setSelectedPackage={setSelectedPackage}
      additionalSponsorPrice={additionalSponsorPrice}
      key="packages"
    />,
    <DetailsStep
      key="information"
      booking={booking}
      setBooking={setBooking}
      errors={fieldErrors}
      view="information"
      section="baptizand"
    />,
    <DetailsStep
      key="godparents"
      booking={booking}
      setBooking={setBooking}
      errors={fieldErrors}
      view="information"
      section="sponsors"
    />,
    <ConfirmationStep
      onEdit={(step) => {
        setAgreedToDeclaration(false);
        setFieldErrors({});
        setStepError(null);
        setSubmitError(null);
        setCurrentStep(step);
      }}
      booking={booking}
      selectedDate={selectedScheduleDate}
      selectedSlot={selectedSlot}
      selectedPackage={selectedPackage}
      additionalSponsorPrice={additionalSponsorPrice}
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
        addError(key, `${validationLabel(label)} is required.`);
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
    requireField("baptizand.address", booking.baptizand.address, "Address");
    requireField(
      "baptizand.contact_number",
      booking.baptizand.contact_number,
      "Contact number",
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
    booking.god_parents.forEach((godParent, i) => {
      requireField(`god_parents.${i}.role`, godParent.role, "Godparent role");
      requireField(
        `god_parents.${i}.first_name`,
        godParent.first_name,
        "First name",
      );
      requireField(
        `god_parents.${i}.last_name`,
        godParent.last_name,
        "Last name",
      );
      requireField(
        `god_parents.${i}.residence`,
        godParent.residence,
        "Residence",
      );
      requireField(
        `god_parents.${i}.requirement_type`,
        godParent.requirement_type,
        "Certificate type",
      );

      if (godParent.requirement_file) {
        if (godParent.requirement_file.size > 5 * 1024 * 1024) {
          addError(
            `god_parents.${i}.requirement_file`,
            `${godParent.requirement_file.name} must not exceed 5 MB.`,
          );
        }

        if (
          !["application/pdf", "image/jpeg", "image/png"].includes(
            godParent.requirement_file.type,
          )
        ) {
          addError(
            `god_parents.${i}.requirement_file`,
            `${godParent.requirement_file.name} must be a PDF, JPG, or PNG file.`,
          );
        }
      }
    });

    booking.documents.forEach((document) => {
      if (document.file.size > 5 * 1024 * 1024) {
        addError(
          `documents.${document.document_type}`,
          `${document.file.name} must not exceed 5 MB.`,
        );
      }
    });

    return errors;
  };

  const validateStep = (step: number): string | null => {
    const isUploadError = (key: string) =>
      key.startsWith("documents.") ||
      key.endsWith(".requirement_type") ||
      key.endsWith(".requirement_file");

    if (step === 2 && booking.booking_slot_id === 0) {
      return "Please select a time slot before continuing.";
    }

    if (step === 3 && booking.service_package_id === 0) {
      return "Please select a package before continuing.";
    }

    if (step === 4 || step === 5) {
      const detailsErrors = Object.fromEntries(
        Object.entries(validateDetailsStep(booking)).filter(
          ([key]) =>
            (!isUploadError(key) || key.endsWith(".requirement_type")) &&
            (step === 5
              ? key.startsWith("god_parents")
              : !key.startsWith("god_parents")),
        ),
      );

      if (
        step === 5 &&
        booking.god_parents.length > 2 &&
        additionalSponsorPrice === null
      ) {
        detailsErrors.pricing = [
          "The additional sponsor rate could not be loaded.",
        ];
      }

      if (Object.keys(detailsErrors).length > 0) {
        setFieldErrors(detailsErrors);
        return "Please complete all required fields before continuing.";
      }

      setFieldErrors({});
    }

    if (step === 6 && !agreedToDeclaration) {
      return "Please agree to the declaration before submitting.";
    }

    return null;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    try {
      await submitBooking(booking, approvedSchedule?.id ?? 0);
      setSubmitted(true);
    } catch (error: unknown) {
      const failure = error as {
        validationErrors?: Record<string, string[]>;
      };

      if (failure.validationErrors) {
        setFieldErrors(failure.validationErrors);
        setCurrentStep(
          validationStep("baptism", failure.validationErrors, currentStep),
        );
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
    if (submitting) return;
    setValidationAttempt((attempt) => attempt + 1);
    setSubmitError(null);
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
            reviewed. Upload requirements from My Profile after schedule
            confirmation.
          </div>
        ) : (
          <>
            {(stepError || submitError) && (
              <AlertBanner
                key={validationAttempt}
                message={stepError ?? submitError ?? ""}
                errors={fieldErrors}
              />
            )}

            {pages[currentStep - 1]}

            <BookingFooter
              busy={submitting}
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
