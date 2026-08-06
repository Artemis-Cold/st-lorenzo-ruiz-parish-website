import { useState, useEffect } from "react";

import DashboardLayout from "../components/DashboardLayout";

import {
  BookingHeader,
  BookingStepper,
  BookingFooter,
} from "../components/booking";

import ScheduleStep from "../components/booking/mass/steps/ScheduleStep";
import DetailsStep from "../components/booking/mass/steps/DetailsStep";
import PaymentStep from "../components/booking/mass/steps/PaymentStep";
import ConfirmationStep from "../components/booking/mass/steps/ConfirmationStep";

import type { MassIntentionBooking } from "../types/mass";

const stepLabels = ["Schedule", "Details", "Payment", "Confirmation"];

export default function Mass() {
  const [booking, setBooking] = useState<MassIntentionBooking>({
    service: "Mass Intention",

    date: null,

    groups: [],

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
    <ScheduleStep booking={booking} setBooking={setBooking} key="schedule" />,
    <DetailsStep key="details" booking={booking} setBooking={setBooking} />,
    <PaymentStep key="payment" booking={booking} setBooking={setBooking} />,
    <ConfirmationStep booking={booking} key="confirmation" />,
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BookingHeader
          title="Mass Intention"
          subtitle="Arrange a Mass Intention Offering"
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
