import { useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import {
  BookingFooter,
  BookingHeader,
  BookingStepper,
} from "../components/booking";
import AlertBanner from "../components/booking/AlertBanner";
import DocumentSelection from "../components/booking/document-request/steps/DocumentSelection";
import DetailsStep from "../components/booking/document-request/steps/DetailsStep";
import PaymentStep from "../components/booking/document-request/steps/PaymentStep";
import ConfirmationStep from "../components/booking/document-request/steps/ConfirmationStep";
import type {
  DocumentDetails,
  DocumentRequestBooking,
} from "../types/document";
import { submitDocumentRequest } from "@/services/documentRequestBookingService";

const stepLabels = ["Selection", "Details", "Payment", "Confirmation"];

export default function Document() {
  const [booking, setBooking] = useState<DocumentRequestBooking>({
    requests: [],
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const pages = [
    <DocumentSelection
      booking={booking}
      setBooking={setBooking}
      errors={fieldErrors}
      key="selection"
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
      key="payment"
    />,
    <ConfirmationStep
      booking={booking}
      agree={agreed}
      setAgree={setAgreed}
      key="confirmation"
    />,
  ];

  const validateDetails = (): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};
    const require = (
      index: number,
      field: keyof DocumentDetails | string,
      value: unknown,
      label: string,
    ) => {
      if (value === null || value === undefined || value === "") {
        errors["requests." + index + ".details." + field] = [
          label + " is required.",
        ];
      }
    };
    const validatePastDate = (
      index: number,
      field: string,
      value: unknown,
      label: string,
    ) => {
      require(index, field, value, label);
      const key = "requests." + index + ".details." + field;
      if (value === null || value === undefined || value === "") return;
      if (!(value instanceof Date)) {
        errors[key] = [label + " must be a valid date."];
        return;
      }

      if (Number.isNaN(value.getTime())) {
        errors[key] = [label + " must be a valid date."];
        return;
      }

      const selected = new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate(),
      );
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (selected > today) {
        errors[key] = [label + " cannot be in the future."];
      }
    };

    booking.requests.forEach((request, index) => {
      const details = request.details as unknown as Record<string, unknown>;
      switch (request.document_type) {
        case "Baptismal Certificate":
          require(index, "name", details.name, "Full name");
          require(index, "address", details.address, "Address");
          validatePastDate(
            index,
            "baptism_date",
            details.baptism_date,
            "Date of baptism",
          );
          break;
        case "Confirmation Certificate":
          require(index, "name", details.name, "Full name");
          require(index, "address", details.address, "Address");
          validatePastDate(
            index,
            "confirmation_date",
            details.confirmation_date,
            "Date of confirmation",
          );
          break;
        case "Death Certificate":
          require(index, "name", details.name, "Full name");
          require(index, "address", details.address, "Address");
          break;
        case "Marriage Certificate":
          require(index, "bride_name", details.bride_name, "Bride's full name");
          require(index, "groom_name", details.groom_name, "Groom's full name");
          require(index, "address", details.address, "Address");
          validatePastDate(
            index,
            "marriage_date",
            details.marriage_date,
            "Marriage date",
          );
          break;
        case "Request of Permission":
          require(index, "full_name", details.full_name, "Full name");
          require(index, "address", details.address, "Address");
          break;
      }
    });

    return errors;
  };

  const validateStep = (step: number): string | null => {
    let errors: Record<string, string[]> = {};
    if (step === 1 && booking.requests.length === 0) {
      errors.requests = ["Select at least one document."];
    } else if (step === 2) {
      errors = validateDetails();
    } else if (step === 3) {
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
    if (step === 4 && !agreed) {
      return "Please agree to the declaration before submitting.";
    }
    return null;
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitDocumentRequest(booking);
      setSubmitted(true);
    } catch (error: unknown) {
      const failure = error as { validationErrors?: Record<string, string[]> };
      if (failure.validationErrors) {
        setFieldErrors(failure.validationErrors);
        setSubmitError("Please review the highlighted fields and try again.");
      } else {
        setSubmitError("Something went wrong submitting the document request.");
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
        <BookingHeader title="Document Request" subtitle="Request Church Documents" />
        <BookingStepper currentStep={currentStep} steps={stepLabels} />
        {submitted ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800">
            Your document request has been submitted. We'll notify you once it
            is reviewed.
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
