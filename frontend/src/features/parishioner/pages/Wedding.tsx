import { useState, useEffect } from "react";

import DashboardLayout from "../components/DashboardLayout";

import {
  BookingHeader,
  BookingStepper,
  BookingFooter,
} from "../components/booking";

import RequirementsStep from "../components/booking/wedding/steps/RequirementsStep";
import ScheduleStep from "../components/booking/wedding/steps/ScheduleStep";
import PackagesStep from "../components/booking/wedding/steps/PackagesStep";
import DetailsStep from "../components/booking/wedding/steps/DetailsStep";
import ConfirmationStep from "../components/booking/wedding/steps/ConfirmationStep";

import type { WeddingBooking } from "../types/wedding";
import { packageItems } from "../data/packages";

const stepLabels = [
  "Requirements",
  "Schedule",
  "Packages",
  "Details",
  "Confirmation",
];

export default function Wedding() {
  const [booking, setBooking] = useState<WeddingBooking>({
    service: "Wedding",

    date: null,

    timeSlot: null,

    package: {
      inclusions: packageItems,
      addOns: [],
    },

    applicant: {
      groom: {
        firstName: "",
        lastName: "",
        middleInitial: "",

        address: "",
        age: null,
        contactNumber: "",

        church: {
          baptizedIn: "",
          confirmedIn: "",
        },

        father: {
          firstName: "",
          lastName: "",
          middleInitial: "",
        },

        mother: {
          firstName: "",
          lastName: "",
          middleInitial: "",
        },

        previousChurchMarriage: {
          churchName: "",
          priest: "",
          churchAddress: "",
        },
      },

      bride: {
        firstName: "",
        lastName: "",
        middleInitial: "",

        address: "",
        age: null,
        contactNumber: "",

        church: {
          baptizedIn: "",
          confirmedIn: "",
        },

        father: {
          firstName: "",
          lastName: "",
          middleInitial: "",
        },

        mother: {
          firstName: "",
          lastName: "",
          middleInitial: "",
        },

        previousChurchMarriage: {
          churchName: "",
          priest: "",
          churchAddress: "",
        },
      },
    },

    remarks: "",
  });

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentStep]);

  const pages = [
    <RequirementsStep key="requirements" />,
    <ScheduleStep key="schedule" />,
    <PackagesStep booking={booking} setBooking={setBooking} />,
    <DetailsStep key="details" booking={booking} setBooking={setBooking} />,
    <ConfirmationStep key="confirmation" />,
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BookingHeader
          title="Wedding"
          subtitle="Schedule your Sacrament of Holy Matrimony"
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
