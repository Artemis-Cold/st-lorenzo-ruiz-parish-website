import { BookingCard } from "../..";
import type {
  ApplicantType,
  Person,
  WeddingBooking,
  WeddingDocument,
} from "../../../../types/wedding";
import type { Dispatch, SetStateAction } from "react";
import FileUploadField from "../summary/FileUploadField";

interface DetailsStepProps {
  booking: WeddingBooking;
  setBooking: Dispatch<SetStateAction<WeddingBooking>>;
  readOnly?: boolean;
  errors?: Record<string, string[]>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="field-error mt-1 text-sm text-red-600">{message}</p>;
}

export default function DetailsStep({
  booking,
  setBooking,
  readOnly,
  errors,
}: DetailsStepProps) {
  const getError = (key: string): string | undefined => errors?.[key]?.[0];

  const inputClass = `
w-full rounded-xl border px-4 py-3 transition
${
  readOnly
    ? "border-gray-200 bg-gray-50 text-gray-700"
    : "border-gray-300 bg-white focus:border-[#B22222] focus:outline-none"
}
`;

  const formClass =
    "space-y-8 [&_div:has(>.field-error)>input]:border-red-400 [&_div:has(>.field-error)>input]:focus:border-red-500";

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
    K extends keyof Person["previous_church_marriage"],
  >(
    applicant: ApplicantType,
    field: K,
    value: Person["previous_church_marriage"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        [applicant]: {
          ...prev.applicant[applicant],
          previous_church_marriage: {
            ...prev.applicant[applicant].previous_church_marriage,
            [field]: value,
          },
        },
      },
    }));
  };

  const getDocument = (type: WeddingDocument["document_type"]) =>
    booking.documents.find((document) => document.document_type === type)
      ?.file ?? null;

  const updateDocument = (
    type: WeddingDocument["document_type"],
    file: File | null,
  ) => {
    setBooking((prev) => ({
      ...prev,
      documents: file
        ? [
            ...prev.documents.filter(
              (document) => document.document_type !== type,
            ),
            { document_type: type, file },
          ]
        : prev.documents.filter((document) => document.document_type !== type),
    }));
  };

  return (
    <>
      <BookingCard title="Groom's Information">
        <form className={formClass}>
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
                  value={booking.applicant.groom.last_name}
                  onChange={(e) =>
                    updateApplicant("groom", "last_name", e.target.value)
                  }
                  placeholder="Enter last name"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("applicant.groom.last_name")} />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.applicant.groom.first_name}
                  onChange={(e) =>
                    updateApplicant("groom", "first_name", e.target.value)
                  }
                  placeholder="Enter first name"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("applicant.groom.first_name")} />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">MI</label>

                <input
                  type="text"
                  maxLength={1}
                  value={booking.applicant.groom.middle_initial}
                  onChange={(e) =>
                    updateApplicant("groom", "middle_initial", e.target.value)
                  }
                  placeholder="M"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("applicant.groom.middle_initial")} />
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
                <FieldError message={getError("applicant.groom.address")} />
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
                <FieldError message={getError("applicant.groom.age")} />
              </div>

              <div className="col-span-12 md:col-span-9">
                <label className="mb-2 block text-sm font-medium">
                  Contact Number <span className="text-red-600">*</span>
                </label>

                <input
                  type="tel"
                  value={booking.applicant.groom.contact_number}
                  onChange={(e) =>
                    updateApplicant("groom", "contact_number", e.target.value)
                  }
                  placeholder="09XX XXX XXXX"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("applicant.groom.contact_number")} />
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
                  value={booking.applicant.groom.church.baptized_in}
                  onChange={(e) =>
                    updateApplicantChurch(
                      "groom",
                      "baptized_in",
                      e.target.value,
                    )
                  }
                />
                <FieldError
                  message={getError("applicant.groom.church.baptized_in")}
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
                  value={booking.applicant.groom.church.confirmed_in}
                  onChange={(e) =>
                    updateApplicantChurch(
                      "groom",
                      "confirmed_in",
                      e.target.value,
                    )
                  }
                />
                <FieldError
                  message={getError("applicant.groom.church.confirmed_in")}
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
                  value={booking.applicant.groom.father.last_name}
                  onChange={(e) =>
                    updateApplicantFather("groom", "last_name", e.target.value)
                  }
                />
                <FieldError
                  message={getError("applicant.groom.father.last_name")}
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
                  value={booking.applicant.groom.father.first_name}
                  onChange={(e) =>
                    updateApplicantFather("groom", "first_name", e.target.value)
                  }
                />
                <FieldError
                  message={getError("applicant.groom.father.first_name")}
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
                  value={booking.applicant.groom.father.middle_initial}
                  onChange={(e) =>
                    updateApplicantFather(
                      "groom",
                      "middle_initial",
                      e.target.value,
                    )
                  }
                />
                <FieldError
                  message={getError("applicant.groom.father.middle_initial")}
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
                  value={booking.applicant.groom.mother.last_name}
                  onChange={(e) =>
                    updateApplicantMother("groom", "last_name", e.target.value)
                  }
                />
                <FieldError
                  message={getError("applicant.groom.mother.last_name")}
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
                  value={booking.applicant.groom.mother.first_name}
                  onChange={(e) =>
                    updateApplicantMother("groom", "first_name", e.target.value)
                  }
                />
                <FieldError
                  message={getError("applicant.groom.mother.first_name")}
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
                  value={booking.applicant.groom.mother.middle_initial}
                  onChange={(e) =>
                    updateApplicantMother(
                      "groom",
                      "middle_initial",
                      e.target.value,
                    )
                  }
                />
                <FieldError
                  message={getError("applicant.groom.mother.middle_initial")}
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
                    booking.applicant.groom.previous_church_marriage.church_name
                  }
                  onChange={(e) =>
                    updateApplicantPreviousMarriage(
                      "groom",
                      "church_name",
                      e.target.value,
                    )
                  }
                />
                <FieldError
                  message={getError(
                    "applicant.groom.previous_church_marriage.church_name",
                  )}
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
                  value={
                    booking.applicant.groom.previous_church_marriage.priest
                  }
                  onChange={(e) =>
                    updateApplicantPreviousMarriage(
                      "groom",
                      "priest",
                      e.target.value,
                    )
                  }
                />
                <FieldError
                  message={getError(
                    "applicant.groom.previous_church_marriage.priest",
                  )}
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
                    booking.applicant.groom.previous_church_marriage
                      .church_address
                  }
                  onChange={(e) =>
                    updateApplicantPreviousMarriage(
                      "groom",
                      "church_address",
                      e.target.value,
                    )
                  }
                />
                <FieldError
                  message={getError(
                    "applicant.groom.previous_church_marriage.church_address",
                  )}
                />
              </div>
            </div>
          </section>
        </form>
      </BookingCard>

      <BookingCard title="Bride's Information">
        <form className={formClass}>
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
                  value={booking.applicant.bride.last_name}
                  onChange={(e) =>
                    updateApplicant("bride", "last_name", e.target.value)
                  }
                  placeholder="Enter last name"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("applicant.bride.last_name")} />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.applicant.bride.first_name}
                  onChange={(e) =>
                    updateApplicant("bride", "first_name", e.target.value)
                  }
                  placeholder="Enter first name"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("applicant.bride.first_name")} />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">MI</label>

                <input
                  type="text"
                  maxLength={1}
                  value={booking.applicant.bride.middle_initial}
                  onChange={(e) =>
                    updateApplicant("bride", "middle_initial", e.target.value)
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
                <FieldError message={getError("applicant.bride.address")} />
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
                <FieldError message={getError("applicant.bride.age")} />
              </div>

              <div className="col-span-12 md:col-span-9">
                <label className="mb-2 block text-sm font-medium">
                  Contact Number <span className="text-red-600">*</span>
                </label>

                <input
                  type="tel"
                  value={booking.applicant.bride.contact_number}
                  onChange={(e) =>
                    updateApplicant("bride", "contact_number", e.target.value)
                  }
                  placeholder="09XX XXX XXXX"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("applicant.bride.contact_number")} />
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
                  value={booking.applicant.bride.church.baptized_in}
                  onChange={(e) =>
                    updateApplicantChurch(
                      "bride",
                      "baptized_in",
                      e.target.value,
                    )
                  }
                />
                <FieldError
                  message={getError("applicant.bride.church.baptized_in")}
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
                  value={booking.applicant.bride.church.confirmed_in}
                  onChange={(e) =>
                    updateApplicantChurch(
                      "bride",
                      "confirmed_in",
                      e.target.value,
                    )
                  }
                />
                <FieldError
                  message={getError("applicant.bride.church.confirmed_in")}
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
                  value={booking.applicant.bride.father.last_name}
                  onChange={(e) =>
                    updateApplicantFather("bride", "last_name", e.target.value)
                  }
                />
                <FieldError
                  message={getError("applicant.bride.father.last_name")}
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
                  value={booking.applicant.bride.father.first_name}
                  onChange={(e) =>
                    updateApplicantFather("bride", "first_name", e.target.value)
                  }
                />
                <FieldError
                  message={getError("applicant.bride.father.first_name")}
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
                  value={booking.applicant.bride.father.middle_initial}
                  onChange={(e) =>
                    updateApplicantFather(
                      "bride",
                      "middle_initial",
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
                  value={booking.applicant.bride.mother.last_name}
                  onChange={(e) =>
                    updateApplicantMother("bride", "last_name", e.target.value)
                  }
                />
                <FieldError
                  message={getError("applicant.bride.mother.last_name")}
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
                  value={booking.applicant.bride.mother.first_name}
                  onChange={(e) =>
                    updateApplicantMother("bride", "first_name", e.target.value)
                  }
                />
                <FieldError
                  message={getError("applicant.bride.mother.first_name")}
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
                  value={booking.applicant.bride.mother.middle_initial}
                  onChange={(e) =>
                    updateApplicantMother(
                      "bride",
                      "middle_initial",
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
                    booking.applicant.bride.previous_church_marriage.church_name
                  }
                  onChange={(e) =>
                    updateApplicantPreviousMarriage(
                      "bride",
                      "church_name",
                      e.target.value,
                    )
                  }
                />
                <FieldError
                  message={getError(
                    "applicant.bride.previous_church_marriage.church_name",
                  )}
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
                  value={
                    booking.applicant.bride.previous_church_marriage.priest
                  }
                  onChange={(e) =>
                    updateApplicantPreviousMarriage(
                      "bride",
                      "priest",
                      e.target.value,
                    )
                  }
                />
                <FieldError
                  message={getError(
                    "applicant.bride.previous_church_marriage.priest",
                  )}
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
                    booking.applicant.bride.previous_church_marriage
                      .church_address
                  }
                  onChange={(e) =>
                    updateApplicantPreviousMarriage(
                      "bride",
                      "church_address",
                      e.target.value,
                    )
                  }
                />
                <FieldError
                  message={getError(
                    "applicant.bride.previous_church_marriage.church_address",
                  )}
                />
              </div>
            </div>
          </section>
        </form>
      </BookingCard>

      <BookingCard title="Requirements">
        <form className={formClass}>
          <section>
            <h3 className="mb-2 border-b pb-2 text-lg font-semibold text-[#B22222]">
              {readOnly
                ? "Submitted Requirements"
                : "Attach Soft Copy of Requirements"}
            </h3>

            <p className="mb-6 text-sm text-gray-500">
              {readOnly
                ? "Review the uploaded documents before submitting your booking request."
                : "Upload the files you currently have. Missing requirements may be submitted later from My Profile while the booking remains pending."}
            </p>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Marriage License"
                  file={getDocument("marriage_license")}
                  onChange={(file) => updateDocument("marriage_license", file)}
                  readOnly={readOnly}
                />
                <FieldError message={getError("documents.marriage_license")} />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Certificate of No Marriage (CENOMAR)"
                  file={getDocument("cenomar")}
                  onChange={(file) => updateDocument("cenomar", file)}
                  readOnly={readOnly}
                />
                <FieldError message={getError("documents.cenomar")} />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Baptismal Certificate"
                  file={getDocument("baptismal_certificate")}
                  onChange={(file) =>
                    updateDocument("baptismal_certificate", file)
                  }
                  readOnly={readOnly}
                />
                <FieldError
                  message={getError("documents.baptismal_certificate")}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Confirmation Certificate"
                  file={getDocument("confirmation_certificate")}
                  onChange={(file) =>
                    updateDocument("confirmation_certificate", file)
                  }
                  readOnly={readOnly}
                />
                <FieldError
                  message={getError("documents.confirmation_certificate")}
                />
              </div>

              <div className="col-span-12">
                <FileUploadField
                  label="Three (3) Copies of 3R Couple Photo"
                  file={getDocument("couple_photo")}
                  onChange={(file) => updateDocument("couple_photo", file)}
                  readOnly={readOnly}
                />
                <FieldError message={getError("documents.couple_photo")} />
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
                  file={getDocument("sponsor_marriage_contract")}
                  onChange={(file) =>
                    updateDocument("sponsor_marriage_contract", file)
                  }
                  readOnly={readOnly}
                />
                <FieldError message={getError("documents.sponsor")} />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Confirmation Certificate"
                  file={getDocument("sponsor_confirmation_certificate")}
                  onChange={(file) =>
                    updateDocument("sponsor_confirmation_certificate", file)
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
