import { useState, useEffect } from "react";

import DashboardLayout from "../components/DashboardLayout";

import {
  BookingHeader,
  BookingStepper,
  BookingFooter,
} from "../components/booking";

import RequirementsStep from "../components/booking/funeral/steps/RequirementsStep";
import ScheduleStep from "../components/booking/funeral/steps/ScheduleStep";
import PackagesStep from "../components/booking/funeral/steps/PackagesStep";
import DetailsStep from "../components/booking/funeral/steps/DetailsStep";
import ConfirmationStep from "../components/booking/funeral/steps/ConfirmationStep";

import type { FuneralBooking } from "../types/funeral";

const stepLabels = [
  "Requirements",
  "Schedule",
  "Packages",
  "Details",
  "Confirmation",
];

export default function Funeral() {
  const [booking, setBooking] = useState<FuneralBooking>({
  service: "Funeral",

  date: null,

  timeSlot: null,

  package: null,

  deceased: {
    firstName: "",
    lastName: "",
    middleInitial: "",

    address: "",
    deathCause: "",
    age: null,
    birthday: null,

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

    spouse: {
      firstName: "",
      lastName: "",
      middleInitial: "",
    },

    children: [],

    sacraments: {
      baptized: false,
      confirmed: false,
      churchMarried: false,
      anointedOfTheSick: false,
    },

    churchLife: {
      attendsMass: "never",
      confesses: "never",
    },

    characteristics: "",

    informant: {
      firstName: "",
      lastName: "",
      middleInitial: "",

      relationship: "",
      contactNumber: "",
      dateProvided: null,
    },
  },

  requirements: {
    deathCertificate: null,
    biography: null,
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
    <ScheduleStep booking={booking} setBooking={setBooking} key="schedule" />,
    <PackagesStep booking={booking} setBooking={setBooking} />,
    <DetailsStep key="details" booking={booking} setBooking={setBooking} />,
    <ConfirmationStep
      booking={booking}
      setBooking={setBooking}
      key="confirmation"
    />,
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BookingHeader
          title="Funeral"
          subtitle="Arrange the Funeral Mass Schedule"
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
