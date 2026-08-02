import { BookingCard } from "../..";
import type { WeddingBooking } from "../../../../types/wedding";
import type { Dispatch, SetStateAction } from "react";
import type { ApplicantType, Person } from "../../../../types/person";
import FileUploadField from "../summary/FileUploadField";

interface DetailsStepProps {
  booking: WeddingBooking;
  setBooking: Dispatch<SetStateAction<WeddingBooking>>;
  readOnly?: boolean;
}

export default function DetailsStep({
  booking,
  setBooking,
  readOnly,
}: DetailsStepProps) {
  const inputClass = `
w-full rounded-xl border px-4 py-3 transition
${
  readOnly
    ? "border-gray-200 bg-gray-50 text-gray-700"
    : "border-gray-300 bg-white focus:border-[#B22222] focus:outline-none"
}
`;

  const updateApplicant = <K extends keyof Person>(
    applicant: ApplicantType,
    field: K,
    value: Person[K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        [applicant]: {
          ...prev.applicant[applicant],
          [field]: value,
        },
      },
    }));
  };

  const updateApplicantChurch = <K extends keyof Person["church"]>(
    applicant: ApplicantType,
    field: K,
    value: Person["church"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        [applicant]: {
          ...prev.applicant[applicant],
          church: {
            ...prev.applicant[applicant].church,
            [field]: value,
          },
        },
      },
    }));
  };

  const updateApplicantFather = <K extends keyof Person["father"]>(
    applicant: ApplicantType,
    field: K,
    value: Person["father"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        [applicant]: {
          ...prev.applicant[applicant],
          father: {
            ...prev.applicant[applicant].father,
            [field]: value,
          },
        },
      },
    }));
  };

  const updateApplicantMother = <K extends keyof Person["mother"]>(
    applicant: ApplicantType,
    field: K,
    value: Person["mother"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        [applicant]: {
          ...prev.applicant[applicant],
          mother: {
            ...prev.applicant[applicant].mother,
            [field]: value,
          },
        },
      },
    }));
  };

  const updateApplicantPreviousMarriage = <
    K extends keyof Person["previousChurchMarriage"],
  >(
    applicant: ApplicantType,
    field: K,
    value: Person["previousChurchMarriage"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        [applicant]: {
          ...prev.applicant[applicant],
          previousChurchMarriage: {
            ...prev.applicant[applicant].previousChurchMarriage,
            [field]: value,
          },
        },
      },
    }));
  };

  const updateRequirement = (
    field: keyof WeddingBooking["requirements"],
    file: File | null,
  ) => {
    setBooking((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: file,
      },
    }));
  };

  return (
    <>
      <BookingCard title="Groom's Information">
        <form className="space-y-8">
          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Personal Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.applicant.groom.lastName}
                  onChange={(e) =>
                    updateApplicant("groom", "lastName", e.target.value)
                  }
                  placeholder="Enter last name"
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.applicant.groom.firstName}
                  onChange={(e) =>
                    updateApplicant("groom", "firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">MI</label>

                <input
                  type="text"
                  maxLength={1}
                  value={booking.applicant.groom.middleInitial}
                  onChange={(e) =>
                    updateApplicant("groom", "middleInitial", e.target.value)
                  }
                  placeholder="M"
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>

              <div className="col-span-12">
                <label className="mb-2 block text-sm font-medium">
                  Address <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.applicant.groom.address}
                  onChange={(e) =>
                    updateApplicant("groom", "address", e.target.value)
                  }
                  placeholder="Street, Barangay, Municipality/City"
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="mb-2 block text-sm font-medium">
                  Age <span className="text-red-600">*</span>
                </label>

                <input
                  type="number"
                  value={booking.applicant.groom.age ?? ""}
                  onChange={(e) =>
                    updateApplicant(
                      "groom",
                      "age",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  placeholder="00"
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>

              <div className="col-span-12 md:col-span-9">
                <label className="mb-2 block text-sm font-medium">
                  Contact Number <span className="text-red-600">*</span>
                </label>

                <input
                  type="tel"
                  value={booking.applicant.groom.contactNumber}
                  onChange={(e) =>
                    updateApplicant("groom", "contactNumber", e.target.value)
                  }
                  placeholder="09XX XXX XXXX"
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Church Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Baptized In <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.groom.church.baptizedIn}
                  onChange={(e) =>
                    updateApplicantChurch("groom", "baptizedIn", e.target.value)
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Confirmed In <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.groom.church.confirmedIn}
                  onChange={(e) =>
                    updateApplicantChurch(
                      "groom",
                      "confirmedIn",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Background Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Father's Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter father's last name"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.groom.father.lastName}
                  onChange={(e) =>
                    updateApplicantFather("groom", "lastName", e.target.value)
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Father's First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter father's first name"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.groom.father.firstName}
                  onChange={(e) =>
                    updateApplicantFather("groom", "firstName", e.target.value)
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Father's MI
                </label>

                <input
                  type="text"
                  maxLength={1}
                  placeholder="M"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.groom.father.middleInitial}
                  onChange={(e) =>
                    updateApplicantFather(
                      "groom",
                      "middleInitial",
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="col-span-12 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  <strong>Reminder:</strong> Please enter the groom's mother's
                  maiden name (surname before marriage).
                </p>
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Mother's Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter mother's last name"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.groom.mother.lastName}
                  onChange={(e) =>
                    updateApplicantMother("groom", "lastName", e.target.value)
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Mother's First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter mother's first name"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.groom.mother.firstName}
                  onChange={(e) =>
                    updateApplicantMother("groom", "firstName", e.target.value)
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Mother's MI
                </label>

                <input
                  type="text"
                  maxLength={1}
                  placeholder="M"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.groom.mother.middleInitial}
                  onChange={(e) =>
                    updateApplicantMother(
                      "groom",
                      "middleInitial",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              In Your Address
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Church Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  readOnly={readOnly}
                  className={inputClass}
                  value={
                    booking.applicant.groom.previousChurchMarriage.churchName
                  }
                  onChange={(e) =>
                    updateApplicantPreviousMarriage(
                      "groom",
                      "churchName",
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Parish Priest <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish Priest"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.groom.previousChurchMarriage.priest}
                  onChange={(e) =>
                    updateApplicantPreviousMarriage(
                      "groom",
                      "priest",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="col-span-12">
                <label className="mb-2 block text-sm font-medium">
                  Church Address <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Street, Barangay, Municipality/City"
                  readOnly={readOnly}
                  className={inputClass}
                  value={
                    booking.applicant.groom.previousChurchMarriage.churchAddress
                  }
                  onChange={(e) =>
                    updateApplicantPreviousMarriage(
                      "groom",
                      "churchAddress",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </section>
        </form>
      </BookingCard>

      <BookingCard title="Bride's Information">
        <form className="space-y-8">
          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Personal Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.applicant.bride.lastName}
                  onChange={(e) =>
                    updateApplicant("bride", "lastName", e.target.value)
                  }
                  placeholder="Enter last name"
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.applicant.bride.firstName}
                  onChange={(e) =>
                    updateApplicant("bride", "firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">MI</label>

                <input
                  type="text"
                  maxLength={1}
                  value={booking.applicant.bride.middleInitial}
                  onChange={(e) =>
                    updateApplicant("bride", "middleInitial", e.target.value)
                  }
                  placeholder="M"
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>

              <div className="col-span-12">
                <label className="mb-2 block text-sm font-medium">
                  Address <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.applicant.bride.address}
                  onChange={(e) =>
                    updateApplicant("bride", "address", e.target.value)
                  }
                  placeholder="Street, Barangay, Municipality/City"
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="mb-2 block text-sm font-medium">
                  Age <span className="text-red-600">*</span>
                </label>

                <input
                  type="number"
                  value={booking.applicant.bride.age ?? ""}
                  onChange={(e) =>
                    updateApplicant(
                      "bride",
                      "age",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  placeholder="00"
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>

              <div className="col-span-12 md:col-span-9">
                <label className="mb-2 block text-sm font-medium">
                  Contact Number <span className="text-red-600">*</span>
                </label>

                <input
                  type="tel"
                  value={booking.applicant.bride.contactNumber}
                  onChange={(e) =>
                    updateApplicant("bride", "contactNumber", e.target.value)
                  }
                  placeholder="09XX XXX XXXX"
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Church Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Baptized In <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.bride.church.baptizedIn}
                  onChange={(e) =>
                    updateApplicantChurch("bride", "baptizedIn", e.target.value)
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Confirmed In <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.bride.church.confirmedIn}
                  onChange={(e) =>
                    updateApplicantChurch(
                      "bride",
                      "confirmedIn",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Background Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Father's Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter father's last name"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.bride.father.lastName}
                  onChange={(e) =>
                    updateApplicantFather("bride", "lastName", e.target.value)
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Father's First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter father's first name"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.bride.father.firstName}
                  onChange={(e) =>
                    updateApplicantFather("bride", "firstName", e.target.value)
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Father's MI
                </label>

                <input
                  type="text"
                  maxLength={1}
                  placeholder="M"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.bride.father.middleInitial}
                  onChange={(e) =>
                    updateApplicantFather(
                      "bride",
                      "middleInitial",
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="col-span-12 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  <strong>Reminder:</strong> Please enter the bride's mother's
                  maiden name (surname before marriage).
                </p>
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Mother's Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter mother's last name"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.bride.mother.lastName}
                  onChange={(e) =>
                    updateApplicantMother("bride", "lastName", e.target.value)
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Mother's First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter mother's first name"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.bride.mother.firstName}
                  onChange={(e) =>
                    updateApplicantMother("bride", "firstName", e.target.value)
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Mother's MI
                </label>

                <input
                  type="text"
                  maxLength={1}
                  placeholder="M"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.bride.mother.middleInitial}
                  onChange={(e) =>
                    updateApplicantMother(
                      "bride",
                      "middleInitial",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              In Your Address
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Church Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish"
                  readOnly={readOnly}
                  className={inputClass}
                  value={
                    booking.applicant.bride.previousChurchMarriage.churchName
                  }
                  onChange={(e) =>
                    updateApplicantPreviousMarriage(
                      "bride",
                      "churchName",
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Parish Priest <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Name of Parish Priest"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.applicant.bride.previousChurchMarriage.priest}
                  onChange={(e) =>
                    updateApplicantPreviousMarriage(
                      "bride",
                      "priest",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="col-span-12">
                <label className="mb-2 block text-sm font-medium">
                  Church Address <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Street, Barangay, Municipality/City"
                  readOnly={readOnly}
                  className={inputClass}
                  value={
                    booking.applicant.bride.previousChurchMarriage.churchAddress
                  }
                  onChange={(e) =>
                    updateApplicantPreviousMarriage(
                      "bride",
                      "churchAddress",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </section>
        </form>
      </BookingCard>

      <BookingCard title="Requirements">
        <form className="space-y-8">
          <section>
            <h3 className="mb-2 border-b pb-2 text-lg font-semibold text-[#B22222]">
              {readOnly
                ? "Submitted Requirements"
                : "Attach Soft Copy of Requirements"}
            </h3>

            <p className="mb-6 text-sm text-gray-500">
              {readOnly
                ? "Review the uploaded documents before submitting your booking request."
                : "Upload clear scanned copies or photos of the required documents. Accepted formats are PDF, JPG, JPEG, and PNG (maximum 5 MB per file)."}
            </p>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Marriage License"
                  required
                  file={booking.requirements.marriageLicense}
                  onChange={(file) =>
                    updateRequirement("marriageLicense", file)
                  }
                  readOnly={readOnly}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Certificate of No Marriage (CENOMAR)"
                  required
                  file={booking.requirements.cenomar}
                  onChange={(file) => updateRequirement("cenomar", file)}
                  readOnly={readOnly}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Baptismal Certificate"
                  required
                  file={booking.requirements.baptismalCertificate}
                  onChange={(file) =>
                    updateRequirement("baptismalCertificate", file)
                  }
                  readOnly={readOnly}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Confirmation Certificate"
                  required
                  file={booking.requirements.confirmationCertificate}
                  onChange={(file) =>
                    updateRequirement("confirmationCertificate", file)
                  }
                  readOnly={readOnly}
                />
              </div>

              <div className="col-span-12">
                <FileUploadField
                  label="Three (3) Copies of 3R Couple Photo"
                  required
                  file={booking.requirements.couplePhoto}
                  onChange={(file) => updateRequirement("couplePhoto", file)}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-2 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Principal Sponsors
            </h3>

            <p className="mb-6 text-sm text-gray-500">
              Upload either the Marriage Contract or the Confirmation
              Certificate of the principal sponsors.
            </p>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Marriage Contract"
                  file={booking.requirements.sponsorMarriageContract}
                  onChange={(file) =>
                    updateRequirement("sponsorMarriageContract", file)
                  }
                  readOnly={readOnly}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Confirmation Certificate"
                  file={booking.requirements.sponsorConfirmationCertificate}
                  onChange={(file) =>
                    updateRequirement("sponsorConfirmationCertificate", file)
                  }
                  readOnly={readOnly}
                />
              </div>
            </div>
          </section>
        </form>
      </BookingCard>
    </>
  );
}
