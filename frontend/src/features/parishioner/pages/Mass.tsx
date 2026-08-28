import { useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import {
  BookingFooter,
  BookingHeader,
  BookingStepper,
} from "../components/booking";
import AlertBanner from "../components/booking/AlertBanner";
import ScheduleStep from "../components/booking/mass/steps/ScheduleStep";
import DetailsStep from "../components/booking/mass/steps/DetailsStep";
import PaymentStep from "../components/booking/mass/steps/PaymentStep";
import ConfirmationStep from "../components/booking/mass/steps/ConfirmationStep";
import IntentionSelector from "../components/booking/mass/summary/IntentionSelector";
import type { MassIntentionBooking } from "../types/mass";
import { submitMassIntention } from "@/services/massIntentionBookingService";
import { getServiceFees } from "@/services/serviceFeeService";
import type { ParishEvent } from "@/services/eventService";

const stepLabels = [
  "Mass Schedule",
  "Intentions",
  "Details",
  "Payment",
  "Confirmation",
];

export default function Mass() {
  const [booking, setBooking] = useState<MassIntentionBooking>({
    intention_date: null,
    mass_event_id: 0,
    groups: [],
    remarks: "",
    reference_number: "",
    receipt: null,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [linePrice, setLinePrice] = useState<number | null>(null);
  const [selectedMass, setSelectedMass] = useState<ParishEvent | null>(null);

  useEffect(() => {
    let active = true;

    getServiceFees("mass-intention")
      .then((fees) => {
        const lineFee = fees.find((fee) => fee.code === "intention_line");
        if (active) setLinePrice(lineFee?.amount ?? null);
      })
      .catch(() => {
        if (active) setLinePrice(null);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const pages = [
    <ScheduleStep
      booking={booking}
      setBooking={setBooking}
      errors={fieldErrors}
      selectedMass={selectedMass}
      setSelectedMass={setSelectedMass}
      key="schedule"
    />,
    <IntentionSelector
      booking={booking}
      setBooking={setBooking}
      errors={fieldErrors}
      key="intentions"
    />,
    <DetailsStep
      booking={booking}
      setBooking={setBooking}
      errors={fieldErrors}
      key="details"
    />,
    <PaymentStep
      booking={booking}
      setBooking={setBooking}
      errors={fieldErrors}
      linePrice={linePrice}
      key="payment"
    />,
    <ConfirmationStep
      booking={booking}
      agree={agreed}
      setAgree={setAgreed}
      linePrice={linePrice}
      selectedMass={selectedMass}
      key="confirmation"
    />,
  ];

  const validateStep = (step: number): string | null => {
    const errors: Record<string, string[]> = {};

    if (step === 1) {
      if (!booking.intention_date) {
        errors.intention_date = ["Please select an intention date."];
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (booking.intention_date <= today) {
          errors.intention_date = [
            "Same-day Mass Intentions are not allowed. Please select tomorrow or a later date.",
          ];
        }
      }
      if (!booking.mass_event_id || !selectedMass) {
        errors.mass_event_id = ["Please select a Mass schedule."];
      }
    }

    if (step === 2) {
      if (booking.groups.length === 0) {
        errors.groups = ["Select at least one intention type."];
      }
    }

    if (step === 3) {
      booking.groups.forEach((group, groupIndex) => {
        group.entries.forEach((entry, entryIndex) => {
          if (
            entry.names.length === 0 ||
            entry.names.every((name) => name.trim() === "")
          ) {
            errors[
              "groups." + groupIndex + ".entries." + entryIndex + ".names"
            ] = ["Enter at least one name."];
          }
        });
      });
    }

    if (step === 4) {
      if (linePrice === null) {
        errors.pricing = [
          "The current Mass Intention rate could not be loaded.",
        ];
      }
      if (!booking.reference_number.trim()) {
        errors.reference_number = ["GCash reference number is required."];
      }
      if (!booking.receipt) {
        errors.receipt = ["Payment receipt is required."];
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return "Please complete all required fields before continuing.";
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
      await submitMassIntention(booking);
      setSubmitted(true);
    } catch (error: unknown) {
      const failure = error as { validationErrors?: Record<string, string[]> };
      if (failure.validationErrors) {
        setFieldErrors(failure.validationErrors);
        setSubmitError("Please review the highlighted fields and try again.");
      } else {
        setSubmitError("Something went wrong submitting the Mass Intention.");
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
        <BookingHeader
          title="Mass Intention"
          subtitle="Arrange a Mass Intention Offering"
        />
        <BookingStepper currentStep={currentStep} steps={stepLabels} />
        {submitted ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800">
            Your Mass Intention has been submitted. We'll notify you once it is
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
