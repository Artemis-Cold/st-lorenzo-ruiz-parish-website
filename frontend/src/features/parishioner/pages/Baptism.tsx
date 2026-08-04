import { useState, useEffect } from "react";

import DashboardLayout from "../components/DashboardLayout";

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

import type { BaptismBooking } from "../types/baptism";

const stepLabels = [
  "Requirements",
  "Schedule",
  "Packages",
  "Details",
  "Confirmation",
];

export default function Baptism() {
  const [booking, setBooking] = useState<BaptismBooking>({
  service: "Baptism",

  date: null,

  timeSlot: null,

  package: null,

  baptizand: {
    firstName: "",
    lastName: "",
    middleInitial: "",

    address: "",
    contactNumber: "",
    gender: "",
    age: null,
    birthDate: null,
    birthPlace: "",

    father: {
      firstName: "",
      lastName: "",
      middleInitial: "",
      birthPlace: ""
    },

    mother: {
      firstName: "",
      lastName: "",
      middleInitial: "",
      birthPlace: ""
    },

    godParents: [
  {
    godFather: {
      firstName: "",
      lastName: "",
      middleInitial: "",
      residence: "",
    },
    godMother: {
      firstName: "",
      lastName: "",
      middleInitial: "",
      residence: "",
    },

    requirements: {
      marriageContract: null,
      confirmationCertificate: null,
    },
  },
],
  },

  requirements: {
    birthCertificate: null,
    baptismPermit: null,
    noRecordCert: null,
  },

  seminarDate: null,
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
          title="Baptism"
          subtitle="Arrange the Celebration of the Sacrament of Baptism"
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
