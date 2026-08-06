import { useState, useEffect } from "react";

import DashboardLayout from "../components/DashboardLayout";

import {
  BookingHeader,
  BookingStepper,
  BookingFooter,
} from "../components/booking";

import DocumentSelection from "../components/booking/document-request/steps/DocumentSelection";
import DetailsStep from "../components/booking/document-request/steps/DetailsStep";
import PaymentStep from "../components/booking/document-request/steps/PaymentStep";
import ConfirmationStep from "../components/booking/document-request/steps/ConfirmationStep";

import type { DocumentRequestBooking } from "../types/document";

const stepLabels = ["Selection", "Details", "Payment", "Confirmation"];

export default function Document() {
  const [booking, setBooking] = useState<DocumentRequestBooking>({
  service: "Document Request",

  requests: [],

  remarks: "",

  referenceNumber: "",
  receipt: null,
});

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentStep]);

  const pages = [
    <DocumentSelection booking={booking} setBooking={setBooking} key="schedule" />,
    <DetailsStep key="details" booking={booking} setBooking={setBooking} />,
    <PaymentStep key="payment" booking={booking} setBooking={setBooking} />,
    <ConfirmationStep booking={booking} key="confirmation" />,
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BookingHeader
          title="Document Request"
          subtitle="Request Church Documents"
        />

        <BookingStepper currentStep={currentStep} steps={stepLabels} />

        {pages[currentStep - 1]}

        <BookingFooter
          previous={
            currentStep > 1
              ? () => setCurrentStep((prev) => prev - 1)
              : undefined
          }
          next={
            currentStep < pages.length
              ? () => setCurrentStep((prev) => prev + 1)
              : undefined
          }
          previousText="Back"
          nextText={
            currentStep === pages.length
              ? "Submit Booking"
              : `Continue to ${stepLabels[currentStep]}`
          }
        />
      </div>
    </DashboardLayout>
  );
}
