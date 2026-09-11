import { BookingCard } from "../..";
import type {
  ApplicantType,
  Person,
  WeddingAccountRole,
  WeddingBooking,
  WeddingDocument,
  WeddingSponsor,
} from "../../../../types/wedding";
import type { Dispatch, SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";
import FileUploadField from "../summary/FileUploadField";
import { useAuth } from "@/contexts/AuthContext";

interface DetailsStepProps {
  booking: WeddingBooking;
  setBooking: Dispatch<SetStateAction<WeddingBooking>>;
  readOnly?: boolean;
  errors?: Record<string, string[]>;
  view?: "all" | "information" | "documents";
  accountRole?: WeddingAccountRole | null;
  onAccountRoleChange?: (role: WeddingAccountRole) => void;
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
  view = "all",
  accountRole,
  onAccountRoleChange,
}: DetailsStepProps) {
  const { user } = useAuth();
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

  const profileAge = () => {
    if (!user?.birth_date) return null;

    const [year, month, day] = user.birth_date
      .slice(0, 10)
      .split("-")
      .map(Number);
    const today = new Date();
    let age = today.getFullYear() - year;

    if (
      today.getMonth() + 1 < month ||
      (today.getMonth() + 1 === month && today.getDate() < day)
    ) {
      age -= 1;
    }

    return Number.isFinite(age) && age >= 0 ? age : null;
  };

  const profileApplicantFields = () => {
    if (!user) return null;

    const address = [
      user.address.house_no,
      user.address.street,
      user.address.barangay,
      user.address.municipality,
      user.address.province,
      user.address.zip_code,
    ]
      .filter((part) => part?.trim())
      .join(", ");

    return {
      first_name: user.first_name,
      middle_initial: user.middle_initial ?? "",
      last_name: user.last_name,
      address,
      age: profileAge(),
      contact_number: user.phone,
    };
  };

  const restoreApplicantFromProfile = (role: ApplicantType) => {
    const profileFields = profileApplicantFields();
    if (!profileFields) return;

    setBooking((previous) => ({
      ...previous,
      applicant: {
        ...previous.applicant,
        [role]: {
          ...previous.applicant[role],
          ...profileFields,
        },
      },
    }));
  };

  const selectAccountRole = (role: WeddingAccountRole) => {
    onAccountRoleChange?.(role);
    if (role === accountRole) return;

    const profileFields = profileApplicantFields();
    const previousApplicantRole =
      accountRole === "groom" || accountRole === "bride" ? accountRole : null;

    setBooking((previous) => {
      const applicants = { ...previous.applicant };

      if (previousApplicantRole && previousApplicantRole !== role) {
        applicants[previousApplicantRole] = {
          ...applicants[previousApplicantRole],
          first_name: "",
          middle_initial: "",
          last_name: "",
          address: "",
          age: null,
          contact_number: "",
        };
      }

      if (role !== "representative" && profileFields) {
        applicants[role] = {
          ...applicants[role],
          ...profileFields,
        };
      }

      return { ...previous, applicant: applicants };
    });
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

  const getDocumentIndex = (type: WeddingDocument["document_type"]) =>
    booking.documents.findIndex((document) => document.document_type === type);

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

  const addSponsor = () => {
    setBooking((prev) => ({
      ...prev,
      sponsors: [
        ...prev.sponsors,
        {
          role: "",
          first_name: "",
          middle_initial: "",
          last_name: "",
          residence: "",
          requirement_type: "",
          requirement_file: null,
        },
      ],
    }));
  };

  const removeSponsor = (index: number) => {
    setBooking((prev) => ({
      ...prev,
      sponsors: prev.sponsors.filter(
        (_, sponsorIndex) => sponsorIndex !== index,
      ),
    }));
  };

  const updateSponsor = <K extends keyof WeddingSponsor>(
    index: number,
    field: K,
    value: WeddingSponsor[K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      sponsors: prev.sponsors.map((sponsor, sponsorIndex) =>
        sponsorIndex === index ? { ...sponsor, [field]: value } : sponsor,
      ),
    }));
  };

  const sponsorLabel = (sponsor: WeddingSponsor, index: number) => {
    const name = [
      sponsor.first_name,
      sponsor.middle_initial
        ? `${sponsor.middle_initial.replace(/\.$/, "")}.`
        : "",
      sponsor.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return name || `Sponsor ${index + 1}`;
  };

  const renderSponsorRequirement = (sponsor: WeddingSponsor, index: number) => (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h5 className="font-semibold text-amber-950">
            Sponsor {index + 1}: {sponsorLabel(sponsor, index)}
          </h5>
          <p className="mt-0.5 text-xs font-medium text-amber-700">
            {sponsor.role === "godfather"
              ? "Godfather (Ninong)"
              : sponsor.role === "godmother"
                ? "Godmother (Ninang)"
                : "Sponsor role not selected"}
          </p>
        </div>
        {!sponsor.requirement_file && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
            To follow
          </span>
        )}
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-gray-800">
          Certificate to submit <span className="text-red-600">*</span>
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(
            [
              ["marriage_contract", "Marriage Certificate"],
              ["confirmation_certificate", "Confirmation Certificate"],
            ] as const
          ).map(([type, label]) => {
            const selected = sponsor.requirement_type === type;

            return (
              <label
                key={type}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                  selected
                    ? "border-[#B22222] bg-white text-[#B22222] ring-1 ring-red-100"
                    : "border-amber-200 bg-white/70 text-gray-700 hover:border-red-200"
                }`}
              >
                <input
                  type="radio"
                  name={`sponsor-requirement-${index}`}
                  value={type}
                  checked={selected}
                  disabled={readOnly}
                  onChange={() => {
                    updateSponsor(index, "requirement_type", type);
                    if (sponsor.requirement_type !== type) {
                      updateSponsor(index, "requirement_file", null);
                    }
                  }}
                  className="size-4 accent-[#B22222]"
                />
                {label}
              </label>
            );
          })}
        </div>
        <FieldError message={getError(`sponsors.${index}.requirement_type`)} />
      </fieldset>

      {sponsor.requirement_type && (
        <div className="mt-4 min-w-0">
          <FileUploadField
            label={`${
              sponsor.requirement_type === "marriage_contract"
                ? "Marriage Certificate"
                : "Confirmation Certificate"
            } PDF`}
            file={sponsor.requirement_file}
            onChange={(file) => updateSponsor(index, "requirement_file", file)}
            accept=".pdf"
            readOnly={readOnly}
          />
          <FieldError
            message={getError(`sponsors.${index}.requirement_file`)}
          />
          {!readOnly && (
            <p className="mt-2 text-xs leading-5 text-amber-800">
              PDF only, up to 5 MB. The file may be submitted later from My
              Profile while the booking is pending.
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {view !== "documents" && !readOnly && onAccountRoleChange && (
        <BookingCard title="Your Role in this Booking">
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-[#292524]">
                Who does this parishioner account belong to?{" "}
                <span className="text-red-600">*</span>
              </h3>
              <p className="mt-1 text-sm leading-5 text-gray-500">
                Selecting the bride or groom copies the account profile into the
                corresponding form. You may still edit the copied details.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["groom", "I am the Groom"],
                  ["bride", "I am the Bride"],
                  ["representative", "I am a Representative"],
                ] as const
              ).map(([role, label]) => {
                const selected = accountRole === role;

                return (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectAccountRole(role)}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
                      selected
                        ? "border-[#B22222] bg-red-50 text-[#B22222] ring-2 ring-red-100"
                        : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50/50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <FieldError message={getError("account_role")} />

            {accountRole && (
              <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="leading-5 text-gray-600">
                  {accountRole === "representative"
                    ? `${user?.full_name ?? "The signed-in parishioner"} will be recorded as the person who submitted this booking. Please complete both applicant forms.`
                    : `Profile details were copied to the ${accountRole} form. Wedding edits will not change your account profile.`}
                </p>
                {accountRole !== "representative" && (
                  <button
                    type="button"
                    onClick={() => restoreApplicantFromProfile(accountRole)}
                    className="shrink-0 rounded-xl border border-[#B22222]/20 bg-white px-4 py-2 font-semibold text-[#B22222] transition hover:bg-red-50"
                  >
                    Restore from profile
                  </button>
                )}
              </div>
            )}
          </div>
        </BookingCard>
      )}

      {view !== "documents" && (
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
                  <FieldError
                    message={getError("applicant.groom.first_name")}
                  />
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
                  <FieldError
                    message={getError("applicant.groom.middle_initial")}
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
                  <FieldError
                    message={getError("applicant.groom.contact_number")}
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
                      updateApplicantFather(
                        "groom",
                        "last_name",
                        e.target.value,
                      )
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
                      updateApplicantFather(
                        "groom",
                        "first_name",
                        e.target.value,
                      )
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
                      updateApplicantMother(
                        "groom",
                        "last_name",
                        e.target.value,
                      )
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
                      updateApplicantMother(
                        "groom",
                        "first_name",
                        e.target.value,
                      )
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
                      booking.applicant.groom.previous_church_marriage
                        .church_name
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
      )}

      {view !== "documents" && (
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
                  <FieldError
                    message={getError("applicant.bride.first_name")}
                  />
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
                  <FieldError
                    message={getError("applicant.bride.contact_number")}
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
                      updateApplicantFather(
                        "bride",
                        "last_name",
                        e.target.value,
                      )
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
                      updateApplicantFather(
                        "bride",
                        "first_name",
                        e.target.value,
                      )
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
                      updateApplicantMother(
                        "bride",
                        "last_name",
                        e.target.value,
                      )
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
                      updateApplicantMother(
                        "bride",
                        "first_name",
                        e.target.value,
                      )
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
                      booking.applicant.bride.previous_church_marriage
                        .church_name
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
      )}

      <BookingCard
        title={view === "information" ? "Principal Sponsors" : "Requirements"}
      >
        <form className={formClass}>
          {view !== "information" && (
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
                    onChange={(file) =>
                      updateDocument("marriage_license", file)
                    }
                    readOnly={readOnly}
                  />
                  <FieldError
                    message={getError("documents.marriage_license")}
                  />
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

                <div className="col-span-12 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <h4 className="font-semibold text-blue-900">
                    Three 3R Couple Photos
                  </h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Attach three separate JPG or PNG image files. PDF files are
                    not accepted for these photo fields.
                  </p>
                </div>

                {(
                  [
                    "couple_photo_1",
                    "couple_photo_2",
                    "couple_photo_3",
                  ] as const
                ).map((type, index) => (
                  <div key={type} className="col-span-12 md:col-span-4">
                    <FileUploadField
                      label={`3R Couple Photo ${index + 1}`}
                      file={getDocument(type)}
                      onChange={(file) => updateDocument(type, file)}
                      accept=".jpg,.jpeg,.png"
                      readOnly={readOnly}
                    />
                    <FieldError
                      message={
                        getError(`documents.${type}`) ??
                        getError(`documents.${getDocumentIndex(type)}.file`)
                      }
                    />
                  </div>
                ))}
              </div>

              {view === "documents" && (
                <div className="mt-8 space-y-5 border-t border-gray-200 pt-7">
                  <div>
                    <h3 className="text-lg font-semibold text-[#B22222]">
                      Individual Sponsor Requirements
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      For every sponsor, select either a Marriage Certificate or
                      Confirmation Certificate, then attach that sponsor's PDF.
                      Files may also be submitted later while the booking is
                      pending.
                    </p>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {booking.sponsors.map((sponsor, sponsorIndex) => (
                      <div key={sponsorIndex} className="min-w-0">
                        {renderSponsorRequirement(sponsor, sponsorIndex)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {view !== "documents" && (
            <section>
              <div className="mb-5 flex items-center justify-between gap-4 border-b pb-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#B22222]">
                    Principal Sponsors
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add sponsors individually and identify each one as a
                    godfather or godmother. Each sponsor submits an individual
                    supporting certificate.
                  </p>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={addSponsor}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#B22222] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#8B1C1C]"
                  >
                    <Plus size={16} /> Add Sponsor
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  {booking.sponsors.map((sponsor, sponsorIndex) => (
                    <div
                      key={sponsorIndex}
                      className="rounded-xl bg-gray-50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h5 className="font-semibold text-gray-700">
                          Sponsor {sponsorIndex + 1}
                        </h5>
                        {!readOnly && booking.sponsors.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeSponsor(sponsorIndex)}
                            aria-label={`Remove sponsor ${sponsorIndex + 1}`}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12">
                          <label className="mb-1.5 block text-sm font-medium">
                            Sponsor Role <span className="text-red-600">*</span>
                          </label>
                          <select
                            value={sponsor.role}
                            onChange={(event) =>
                              updateSponsor(
                                sponsorIndex,
                                "role",
                                event.target.value as WeddingSponsor["role"],
                              )
                            }
                            disabled={readOnly}
                            className={inputClass}
                          >
                            <option value="">Select sponsor role</option>
                            <option value="godfather">
                              Godfather (Ninong)
                            </option>
                            <option value="godmother">
                              Godmother (Ninang)
                            </option>
                          </select>
                          <FieldError
                            message={getError(`sponsors.${sponsorIndex}.role`)}
                          />
                        </div>

                        <div className="col-span-12 sm:col-span-5">
                          <label className="mb-1.5 block text-sm font-medium">
                            Last Name <span className="text-red-600">*</span>
                          </label>
                          <input
                            value={sponsor.last_name}
                            onChange={(event) =>
                              updateSponsor(
                                sponsorIndex,
                                "last_name",
                                event.target.value,
                              )
                            }
                            readOnly={readOnly}
                            placeholder="Last name"
                            className={inputClass}
                          />
                          <FieldError
                            message={getError(
                              `sponsors.${sponsorIndex}.last_name`,
                            )}
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-5">
                          <label className="mb-1.5 block text-sm font-medium">
                            First Name <span className="text-red-600">*</span>
                          </label>
                          <input
                            value={sponsor.first_name}
                            onChange={(event) =>
                              updateSponsor(
                                sponsorIndex,
                                "first_name",
                                event.target.value,
                              )
                            }
                            readOnly={readOnly}
                            placeholder="First name"
                            className={inputClass}
                          />
                          <FieldError
                            message={getError(
                              `sponsors.${sponsorIndex}.first_name`,
                            )}
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-2">
                          <label className="mb-1.5 block text-sm font-medium">
                            MI
                          </label>
                          <input
                            maxLength={1}
                            value={sponsor.middle_initial}
                            onChange={(event) =>
                              updateSponsor(
                                sponsorIndex,
                                "middle_initial",
                                event.target.value,
                              )
                            }
                            readOnly={readOnly}
                            placeholder="M"
                            className={inputClass}
                          />
                          <FieldError
                            message={getError(
                              `sponsors.${sponsorIndex}.middle_initial`,
                            )}
                          />
                        </div>
                        <div className="col-span-12">
                          <label className="mb-1.5 block text-sm font-medium">
                            Residence <span className="text-red-600">*</span>
                          </label>
                          <input
                            value={sponsor.residence}
                            onChange={(event) =>
                              updateSponsor(
                                sponsorIndex,
                                "residence",
                                event.target.value,
                              )
                            }
                            readOnly={readOnly}
                            placeholder="Complete residence"
                            className={inputClass}
                          />
                          <FieldError
                            message={getError(
                              `sponsors.${sponsorIndex}.residence`,
                            )}
                          />
                        </div>
                      </div>

                      {view === "all" && (
                        <div className="mt-5">
                          {renderSponsorRequirement(sponsor, sponsorIndex)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {errors?.sponsors?.[0] && (
                  <FieldError message={errors.sponsors[0]} />
                )}
              </div>
            </section>
          )}
        </form>
      </BookingCard>
    </>
  );
}
