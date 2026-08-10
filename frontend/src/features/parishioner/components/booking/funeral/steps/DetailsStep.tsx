import { BookingCard } from "../..";
import type {
  FuneralBooking,
  FuneralDocument,
  Participation,
} from "../../../../types/funeral";
import type { Dispatch, SetStateAction } from "react";
import FileUploadField from "../summary/FileUploadField";

interface DetailsStepProps {
  booking: FuneralBooking;
  setBooking: Dispatch<SetStateAction<FuneralBooking>>;
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
  const getError = (key: string) => errors?.[key]?.[0];
  const inputClass = `
w-full rounded-xl border px-4 py-3 transition
${
  readOnly
    ? "border-gray-200 bg-gray-50 text-gray-700"
    : "border-gray-300 bg-white focus:border-[#B22222] focus:outline-none"
}
`;

  const updateDeceased = <K extends keyof FuneralBooking["deceased"]>(
    field: K,
    value: FuneralBooking["deceased"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      deceased: {
        ...prev.deceased,
        [field]: value,
      },
    }));
  };

  const updateDeceasedFather = <
    K extends keyof FuneralBooking["deceased"]["father"],
  >(
    field: K,
    value: FuneralBooking["deceased"]["father"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      deceased: {
        ...prev.deceased,
        father: {
          ...prev.deceased.father,
          [field]: value,
        },
      },
    }));
  };

  const updateDeceasedMother = <
    K extends keyof FuneralBooking["deceased"]["mother"],
  >(
    field: K,
    value: FuneralBooking["deceased"]["mother"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      deceased: {
        ...prev.deceased,
        mother: {
          ...prev.deceased.mother,
          [field]: value,
        },
      },
    }));
  };

  const updateSpouse = <K extends keyof FuneralBooking["deceased"]["spouse"]>(
    field: K,
    value: FuneralBooking["deceased"]["spouse"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      deceased: {
        ...prev.deceased,
        spouse: {
          ...prev.deceased.spouse,
          [field]: value,
        },
      },
    }));
  };

  const addChild = () => {
    setBooking((prev) => ({
      ...prev,
      deceased: {
        ...prev.deceased,
        children: [
          ...prev.deceased.children,
          {
            first_name: "",
            last_name: "",
            middle_initial: "",
          },
        ],
      },
    }));
  };

  const updateChild = <
    K extends keyof FuneralBooking["deceased"]["children"][number],
  >(
    index: number,
    field: K,
    value: FuneralBooking["deceased"]["children"][number][K],
  ) => {
    setBooking((prev) => {
      const children = [...prev.deceased.children];

      children[index] = {
        ...children[index],
        [field]: value,
      };

      return {
        ...prev,
        deceased: {
          ...prev.deceased,
          children,
        },
      };
    });
  };

  const removeChild = (index: number) => {
    setBooking((prev) => ({
      ...prev,
      deceased: {
        ...prev.deceased,
        children: prev.deceased.children.filter((_, i) => i !== index),
      },
    }));
  };

  const updateSacrament = <
    K extends keyof FuneralBooking["deceased"]["sacraments"],
  >(
    field: K,
    value: FuneralBooking["deceased"]["sacraments"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      deceased: {
        ...prev.deceased,
        sacraments: {
          ...prev.deceased.sacraments,
          [field]: value,
        },
      },
    }));
  };

  const updateChurchLife = <
    K extends keyof FuneralBooking["deceased"]["church_life"],
  >(
    field: K,
    value: FuneralBooking["deceased"]["church_life"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      deceased: {
        ...prev.deceased,
        church_life: {
          ...prev.deceased.church_life,
          [field]: value,
        },
      },
    }));
  };

  const updateCharacteristics = (value: string) => {
    setBooking((prev) => ({
      ...prev,
      deceased: {
        ...prev.deceased,
        characteristics: value,
      },
    }));
  };

  const updateInformant = <
    K extends keyof FuneralBooking["deceased"]["informant"],
  >(
    field: K,
    value: FuneralBooking["deceased"]["informant"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      deceased: {
        ...prev.deceased,
        informant: {
          ...prev.deceased.informant,
          [field]: value,
        },
      },
    }));
  };

  const getDocument = (type: FuneralDocument["document_type"]) =>
    booking.documents.find((document) => document.document_type === type)
      ?.file ?? null;

  const updateDocument = (
    type: FuneralDocument["document_type"],
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
        : prev.documents.filter(
            (document) => document.document_type !== type,
          ),
    }));
  };

  return (
    <>
      <BookingCard title="Deceased's Information">
        <form className="space-y-8 [&_div:has(>.field-error)>input]:border-red-400 [&_div:has(>.field-error)>input]:focus:border-red-500 [&_div:has(>.field-error)>textarea]:border-red-400 [&_div:has(>.field-error)>textarea]:focus:border-red-500">
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
                  value={booking.deceased.last_name}
                  onChange={(e) => updateDeceased("last_name", e.target.value)}
                  placeholder="Enter last name"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("deceased.last_name")} />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.deceased.first_name}
                  onChange={(e) => updateDeceased("first_name", e.target.value)}
                  placeholder="Enter first name"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("deceased.first_name")} />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">MI</label>

                <input
                  type="text"
                  maxLength={1}
                  value={booking.deceased.middle_initial}
                  onChange={(e) =>
                    updateDeceased("middle_initial", e.target.value)
                  }
                  placeholder="M"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("deceased.middle_initial")} />
              </div>

              <div className="col-span-12">
                <label className="mb-2 block text-sm font-medium">
                  Address <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.deceased.address}
                  onChange={(e) => updateDeceased("address", e.target.value)}
                  placeholder="Street, Barangay, Municipality/City"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("deceased.address")} />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="mb-2 block text-sm font-medium">
                  Age <span className="text-red-600">*</span>
                </label>

                <input
                  type="number"
                  value={booking.deceased.age ?? ""}
                  onChange={(e) =>
                    updateDeceased(
                      "age",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  placeholder="00"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("deceased.age")} />
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="mb-2 block text-sm font-medium">
                  Birthday <span className="text-red-600">*</span>
                </label>

                <input
                  type="date"
                  value={
                    booking.deceased.birth_date
                      ? booking.deceased.birth_date.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    updateDeceased(
                      "birth_date",
                      e.target.value ? new Date(e.target.value) : null,
                    )
                  }
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("deceased.birth_date")} />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Cause of Death <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.deceased.death_cause}
                  onChange={(e) => updateDeceased("death_cause", e.target.value)}
                  placeholder="Cause of Death"
                  readOnly={readOnly}
                  className={inputClass}
                />
                <FieldError message={getError("deceased.death_cause")} />
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
                  value={booking.deceased.father.last_name}
                  onChange={(e) => updateDeceasedFather("last_name", e.target.value)}
                />
                <FieldError message={getError("deceased.father.last_name")} />
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
                  value={booking.deceased.father.first_name}
                  onChange={(e) => updateDeceasedFather("first_name", e.target.value)}
                />
                <FieldError message={getError("deceased.father.first_name")} />
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
                  value={booking.deceased.father.middle_initial}
                  onChange={(e) =>
                    updateDeceasedFather("middle_initial", e.target.value)
                  }
                />
                <FieldError message={getError("deceased.father.middle_initial")} />
              </div>

              <div className="col-span-12 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  <strong>Reminder:</strong> Please enter the deceased's
                  mother's maiden name (surname before marriage).
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
                  value={booking.deceased.mother.last_name}
                  onChange={(e) =>
                    updateDeceasedMother("last_name", e.target.value)
                  }
                />
                <FieldError message={getError("deceased.mother.last_name")} />
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
                  value={booking.deceased.mother.first_name}
                  onChange={(e) =>
                    updateDeceasedMother("first_name", e.target.value)
                  }
                />
                <FieldError message={getError("deceased.mother.first_name")} />
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
                  value={booking.deceased.mother.middle_initial}
                  onChange={(e) =>
                    updateDeceasedMother("middle_initial", e.target.value)
                  }
                />
                <FieldError message={getError("deceased.mother.middle_initial")} />
              </div>

              <div className="col-span-12 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={booking.deceased.has_spouse}
                    disabled={readOnly}
                    onChange={(event) => setBooking((previous) => ({
                      ...previous,
                      deceased: {
                        ...previous.deceased,
                        has_spouse: event.target.checked,
                        spouse: event.target.checked
                          ? previous.deceased.spouse
                          : { first_name: "", middle_initial: "", last_name: "" },
                      },
                    }))}
                    className="h-4 w-4 accent-[#B22222]"
                  />
                  Include spouse information
                </label>
                <p className="mt-1 pl-7 text-xs text-gray-500">
                  Leave this unchecked if the deceased had no spouse.
                </p>
              </div>

              {booking.deceased.has_spouse && <>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Spouse's Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter spouse's last name"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.deceased.spouse.last_name}
                  onChange={(e) => updateSpouse("last_name", e.target.value)}
                />
                <FieldError message={getError("deceased.spouse.last_name")} />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Spouse's First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter spouse's first name"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.deceased.spouse.first_name}
                  onChange={(e) => updateSpouse("first_name", e.target.value)}
                />
                <FieldError message={getError("deceased.spouse.first_name")} />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Spouse's MI
                </label>

                <input
                  type="text"
                  maxLength={1}
                  placeholder="M"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.deceased.spouse.middle_initial}
                  onChange={(e) =>
                    updateSpouse("middle_initial", e.target.value)
                  }
                />
                <FieldError message={getError("deceased.spouse.middle_initial")} />
              </div>
              </>}
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Children
            </h3>

            <div className="space-y-6">
              {booking.deceased.children.map((child, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold">Child #{index + 1}</h4>

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => removeChild(index)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-5">
                      <label className="mb-2 block text-sm font-medium">
                        Last Name
                      </label>

                      <input
                        type="text"
                        value={child.last_name}
                        onChange={(e) =>
                          updateChild(index, "last_name", e.target.value)
                        }
                        readOnly={readOnly}
                        className={inputClass}
                        placeholder="Enter child's last name"
                      />
                      <FieldError
                        message={getError(
                          "deceased.children." + index + ".last_name",
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-5">
                      <label className="mb-2 block text-sm font-medium">
                        First Name
                      </label>

                      <input
                        type="text"
                        value={child.first_name}
                        onChange={(e) =>
                          updateChild(index, "first_name", e.target.value)
                        }
                        readOnly={readOnly}
                        className={inputClass}
                        placeholder="Enter child's first name"
                      />
                      <FieldError
                        message={getError(
                          "deceased.children." + index + ".first_name",
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-2">
                      <label className="mb-2 block text-sm font-medium">
                        MI
                      </label>

                      <input
                        type="text"
                        maxLength={1}
                        value={child.middle_initial}
                        onChange={(e) =>
                          updateChild(index, "middle_initial", e.target.value)
                        }
                        readOnly={readOnly}
                        className={inputClass}
                        placeholder="M"
                      />
                      <FieldError
                        message={getError(
                          "deceased.children." + index + ".middle_initial",
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {!readOnly && (
                <button
                  type="button"
                  onClick={addChild}
                  className="rounded-xl bg-[#B22222] px-5 py-3 font-medium text-white transition hover:bg-[#8B1C1C]"
                >
                  + Add Child
                </button>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Sacramental Information
            </h3>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <label className="flex items-center gap-3 rounded-xl border p-4">
                  <input
                    type="checkbox"
                    checked={booking.deceased.sacraments.baptized}
                    onChange={(e) =>
                      updateSacrament("baptized", e.target.checked)
                    }
                    disabled={readOnly}
                    className="h-5 w-5 accent-[#B22222]"
                  />

                  <span>Baptized</span>
                </label>
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="flex items-center gap-3 rounded-xl border p-4">
                  <input
                    type="checkbox"
                    checked={booking.deceased.sacraments.confirmed}
                    onChange={(e) =>
                      updateSacrament("confirmed", e.target.checked)
                    }
                    disabled={readOnly}
                    className="h-5 w-5 accent-[#B22222]"
                  />

                  <span>Confirmed</span>
                </label>
              </div>
              <div className="col-span-12 md:col-span-6">
                <label className="flex items-center gap-3 rounded-xl border p-4">
                  <input
                    type="checkbox"
                    checked={booking.deceased.sacraments.church_married}
                    onChange={(e) =>
                      updateSacrament("church_married", e.target.checked)
                    }
                    disabled={readOnly}
                    className="h-5 w-5 accent-[#B22222]"
                  />

                  <span>Married in Church</span>
                </label>
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="flex items-center gap-3 rounded-xl border p-4">
                  <input
                    type="checkbox"
                    checked={booking.deceased.sacraments.anointed_of_the_sick}
                    onChange={(e) =>
                      updateSacrament("anointed_of_the_sick", e.target.checked)
                    }
                    disabled={readOnly}
                    className="h-5 w-5 accent-[#B22222]"
                  />

                  <span>Anointed of the Sick</span>
                </label>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Church Life
            </h3>

            <div className="space-y-8">
              {/* Mass Attendance */}
              <div>
                <label className="mb-3 block text-sm font-medium">
                  Mass Attendance <span className="text-red-600">*</span>
                </label>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { value: "regular", label: "Regular" },
                    { value: "sometimes", label: "Sometimes" },
                    { value: "never", label: "Never" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border p-4 transition ${
                        booking.deceased.church_life.attends_mass === option.value
                          ? "border-[#B22222] bg-red-50"
                          : "border-gray-300 hover:border-[#B22222]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="attends_mass"
                          value={option.value}
                          checked={
                            booking.deceased.church_life.attends_mass ===
                            option.value
                          }
                          onChange={() =>
                            updateChurchLife(
                              "attends_mass",
                              option.value as Participation,
                            )
                          }
                          disabled={readOnly}
                          className="h-5 w-5 accent-[#B22222]"
                        />

                        <span>{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <FieldError
                  message={getError("deceased.church_life.attends_mass")}
                />
              </div>

              {/* Confession */}
              <div>
                <label className="mb-3 block text-sm font-medium">
                  Frequency of Confession{" "}
                  <span className="text-red-600">*</span>
                </label>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { value: "regular", label: "Regular" },
                    { value: "sometimes", label: "Sometimes" },
                    { value: "never", label: "Never" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border p-4 transition ${
                        booking.deceased.church_life.confesses === option.value
                          ? "border-[#B22222] bg-red-50"
                          : "border-gray-300 hover:border-[#B22222]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="confesses"
                          value={option.value}
                          checked={
                            booking.deceased.church_life.confesses ===
                            option.value
                          }
                          onChange={() =>
                            updateChurchLife(
                              "confesses",
                              option.value as Participation,
                            )
                          }
                          disabled={readOnly}
                          className="h-5 w-5 accent-[#B22222]"
                        />

                        <span>{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <FieldError
                  message={getError("deceased.church_life.confesses")}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Characteristics
            </h3>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Characteristics of the Deceased{" "}
                <span className="text-red-600">*</span>
              </label>

              <textarea
                rows={6}
                placeholder="Describe the personality, interests, hobbies, organizations, achievements, memorable qualities, and other information about the deceased..."
                value={booking.deceased.characteristics}
                onChange={(e) => updateCharacteristics(e.target.value)}
                readOnly={readOnly}
                className={`${inputClass} resize-none`}
              />
              <FieldError message={getError("deceased.characteristics")} />

              <p className="mt-2 text-xs text-gray-500">
                This information may help the parish prepare the funeral service
                or memorial tribute.
              </p>
            </div>
          </section>
        </form>
      </BookingCard>

      <BookingCard title="Informant's Detail">
        <section className="[&_div:has(>.field-error)>input]:border-red-400 [&_div:has(>.field-error)>input]:focus:border-red-500">
          <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
            Informant
          </h3>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-5">
              <label className="mb-2 block text-sm font-medium">
                Last Name <span className="text-red-600">*</span>
              </label>

              <input
                type="text"
                value={booking.deceased.informant.last_name}
                onChange={(e) => updateInformant("last_name", e.target.value)}
                readOnly={readOnly}
                className={inputClass}
                placeholder="Enter last name"
              />
              <FieldError
                message={getError("deceased.informant.last_name")}
              />
            </div>
            <div className="col-span-12 md:col-span-5">
              <label className="mb-2 block text-sm font-medium">
                First Name <span className="text-red-600">*</span>
              </label>

              <input
                type="text"
                value={booking.deceased.informant.first_name}
                onChange={(e) => updateInformant("first_name", e.target.value)}
                readOnly={readOnly}
                className={inputClass}
                placeholder="Enter first name"
              />
              <FieldError
                message={getError("deceased.informant.first_name")}
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="mb-2 block text-sm font-medium">MI</label>

              <input
                type="text"
                maxLength={1}
                value={booking.deceased.informant.middle_initial}
                onChange={(e) =>
                  updateInformant("middle_initial", e.target.value)
                }
                readOnly={readOnly}
                className={inputClass}
                placeholder="M"
              />
              <FieldError
                message={getError("deceased.informant.middle_initial")}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="mb-2 block text-sm font-medium">
                Relationship to the Deceased
                <span className="text-red-600"> *</span>
              </label>

              <input
                type="text"
                value={booking.deceased.informant.relationship}
                onChange={(e) =>
                  updateInformant("relationship", e.target.value)
                }
                readOnly={readOnly}
                className={inputClass}
                placeholder="e.g. Son, Daughter, Spouse, Brother"
              />
              <FieldError
                message={getError("deceased.informant.relationship")}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="mb-2 block text-sm font-medium">
                Contact Number
                <span className="text-red-600"> *</span>
              </label>

              <input
                type="tel"
                value={booking.deceased.informant.contact_number}
                onChange={(e) =>
                  updateInformant("contact_number", e.target.value)
                }
                readOnly={readOnly}
                className={inputClass}
                placeholder="09XX XXX XXXX"
              />
              <FieldError
                message={getError("deceased.informant.contact_number")}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="mb-2 block text-sm font-medium">
                Date Information Provided
                <span className="text-red-600"> *</span>
              </label>

              <input
                type="date"
                value={
                  booking.deceased.informant.date_provided
                    ?.toISOString()
                    .split("T")[0] ?? ""
                }
                onChange={(e) =>
                  updateInformant(
                    "date_provided",
                    e.target.value ? new Date(e.target.value) : null,
                  )
                }
                readOnly={readOnly}
                className={inputClass}
              />
              <FieldError
                message={getError("deceased.informant.date_provided")}
              />
            </div>
          </div>
        </section>
      </BookingCard>

      <BookingCard title="Requirements">
        <form className="space-y-8 [&_div:has(>.field-error)>input]:border-red-400 [&_div:has(>.field-error)>input]:focus:border-red-500">
          <section>
            <h3 className="mb-2 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Attach Soft Copy of Requirements
            </h3>

            <p className="mb-6 text-sm text-gray-500">
              Upload clear scanned copies or photos of the required documents.
              Accepted formats are PDF, JPG, JPEG, and PNG (maximum 2 MB per
              file).
            </p>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Death Certificate"
                  required
                  file={getDocument("death_certificate")}
                  onChange={(file) =>
                    updateDocument("death_certificate", file)
                  }
                  readOnly={readOnly}
                />
                <FieldError
                  message={getError("documents.death_certificate")}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Biography of the Deceased"
                  required
                  file={getDocument("biography")}
                  onChange={(file) => updateDocument("biography", file)}
                  readOnly={readOnly}
                />
                <FieldError message={getError("documents.biography")} />
              </div>
            </div>
          </section>
        </form>
      </BookingCard>
    </>
  );
}
