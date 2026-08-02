import { BookingCard } from "../..";
import type { FuneralBooking } from "../../../../types/funeral";
import type { Dispatch, SetStateAction } from "react";
import type { Participation } from "../../../../types/person";
import FileUploadField from "../summary/FileUploadField";

interface DetailsStepProps {
  booking: FuneralBooking;
  setBooking: Dispatch<SetStateAction<FuneralBooking>>;
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
            firstName: "",
            lastName: "",
            middleInitial: "",
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
    K extends keyof FuneralBooking["deceased"]["churchLife"],
  >(
    field: K,
    value: FuneralBooking["deceased"]["churchLife"][K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      deceased: {
        ...prev.deceased,
        churchLife: {
          ...prev.deceased.churchLife,
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

  const updateRequirement = <
  K extends keyof FuneralBooking["requirements"],
>(
  field: K,
  file: FuneralBooking["requirements"][K],
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
      <BookingCard title="Deceased's Information">
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
                  value={booking.deceased.lastName}
                  onChange={(e) => updateDeceased("lastName", e.target.value)}
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
                  value={booking.deceased.firstName}
                  onChange={(e) => updateDeceased("firstName", e.target.value)}
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
                  value={booking.deceased.middleInitial}
                  onChange={(e) =>
                    updateDeceased("middleInitial", e.target.value)
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
                  value={booking.deceased.address}
                  onChange={(e) => updateDeceased("address", e.target.value)}
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
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="mb-2 block text-sm font-medium">
                  Birthday <span className="text-red-600">*</span>
                </label>

                <input
                  type="date"
                  value={
                    booking.deceased.birthday
                      ? booking.deceased.birthday.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    updateDeceased(
                      "birthday",
                      e.target.value ? new Date(e.target.value) : null,
                    )
                  }
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Cause of Death <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.deceased.deathCause}
                  onChange={(e) => updateDeceased("deathCause", e.target.value)}
                  placeholder="Cause of Death"
                  readOnly={readOnly}
                  className={inputClass}
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
                  value={booking.deceased.father.lastName}
                  onChange={(e) => updateDeceasedFather("lastName", e.target.value)}
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
                  value={booking.deceased.father.firstName}
                  onChange={(e) => updateDeceasedFather("firstName", e.target.value)}
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
                  value={booking.deceased.father.middleInitial}
                  onChange={(e) =>
                    updateDeceasedFather("middleInitial", e.target.value)
                  }
                />
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
                  value={booking.deceased.mother.lastName}
                  onChange={(e) =>
                    updateDeceasedMother("lastName", e.target.value)
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
                  value={booking.deceased.mother.firstName}
                  onChange={(e) =>
                    updateDeceasedMother("firstName", e.target.value)
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
                  value={booking.deceased.mother.middleInitial}
                  onChange={(e) =>
                    updateDeceasedMother("middleInitial", e.target.value)
                  }
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Spouse's Last Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter spouse's last name"
                  readOnly={readOnly}
                  className={inputClass}
                  value={booking.deceased.spouse.lastName}
                  onChange={(e) => updateSpouse("lastName", e.target.value)}
                />
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
                  value={booking.deceased.spouse.firstName}
                  onChange={(e) => updateSpouse("firstName", e.target.value)}
                />
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
                  value={booking.deceased.spouse.middleInitial}
                  onChange={(e) =>
                    updateSpouse("middleInitial", e.target.value)
                  }
                />
              </div>
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
                        value={child.lastName}
                        onChange={(e) =>
                          updateChild(index, "lastName", e.target.value)
                        }
                        readOnly={readOnly}
                        className={inputClass}
                        placeholder="Enter child's last name"
                      />
                    </div>

                    <div className="col-span-12 md:col-span-5">
                      <label className="mb-2 block text-sm font-medium">
                        First Name
                      </label>

                      <input
                        type="text"
                        value={child.firstName}
                        onChange={(e) =>
                          updateChild(index, "firstName", e.target.value)
                        }
                        readOnly={readOnly}
                        className={inputClass}
                        placeholder="Enter child's first name"
                      />
                    </div>

                    <div className="col-span-12 md:col-span-2">
                      <label className="mb-2 block text-sm font-medium">
                        MI
                      </label>

                      <input
                        type="text"
                        maxLength={1}
                        value={child.middleInitial}
                        onChange={(e) =>
                          updateChild(index, "middleInitial", e.target.value)
                        }
                        readOnly={readOnly}
                        className={inputClass}
                        placeholder="M"
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
                    checked={booking.deceased.sacraments.churchMarried}
                    onChange={(e) =>
                      updateSacrament("churchMarried", e.target.checked)
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
                    checked={booking.deceased.sacraments.anointedOfTheSick}
                    onChange={(e) =>
                      updateSacrament("anointedOfTheSick", e.target.checked)
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
                  Mass Attendance
                </label>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { value: "regular", label: "Regular" },
                    { value: "occasional", label: "Occasional" },
                    { value: "never", label: "Never" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border p-4 transition ${
                        booking.deceased.churchLife.attendsMass === option.value
                          ? "border-[#B22222] bg-red-50"
                          : "border-gray-300 hover:border-[#B22222]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="attendsMass"
                          value={option.value}
                          checked={
                            booking.deceased.churchLife.attendsMass ===
                            option.value
                          }
                          onChange={() =>
                            updateChurchLife(
                              "attendsMass",
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
              </div>

              {/* Confession */}
              <div>
                <label className="mb-3 block text-sm font-medium">
                  Frequency of Confession
                </label>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { value: "regular", label: "Regular" },
                    { value: "occasional", label: "Occasional" },
                    { value: "never", label: "Never" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border p-4 transition ${
                        booking.deceased.churchLife.confesses === option.value
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
                            booking.deceased.churchLife.confesses ===
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
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Characteristics
            </h3>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Characteristics of the Deceased
              </label>

              <textarea
                rows={6}
                placeholder="Describe the personality, interests, hobbies, organizations, achievements, memorable qualities, and other information about the deceased..."
                value={booking.deceased.characteristics}
                onChange={(e) => updateCharacteristics(e.target.value)}
                readOnly={readOnly}
                className={`${inputClass} resize-none`}
              />

              <p className="mt-2 text-xs text-gray-500">
                This information may help the parish prepare the funeral service
                or memorial tribute.
              </p>
            </div>
          </section>
        </form>
      </BookingCard>

      <BookingCard title="Informant's Detail">
        <section>
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
                value={booking.deceased.informant.lastName}
                onChange={(e) => updateInformant("lastName", e.target.value)}
                readOnly={readOnly}
                className={inputClass}
                placeholder="Enter last name"
              />
            </div>
            <div className="col-span-12 md:col-span-5">
              <label className="mb-2 block text-sm font-medium">
                First Name <span className="text-red-600">*</span>
              </label>

              <input
                type="text"
                value={booking.deceased.informant.firstName}
                onChange={(e) => updateInformant("firstName", e.target.value)}
                readOnly={readOnly}
                className={inputClass}
                placeholder="Enter first name"
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="mb-2 block text-sm font-medium">MI</label>

              <input
                type="text"
                maxLength={1}
                value={booking.deceased.informant.middleInitial}
                onChange={(e) =>
                  updateInformant("middleInitial", e.target.value)
                }
                readOnly={readOnly}
                className={inputClass}
                placeholder="M"
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
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="mb-2 block text-sm font-medium">
                Contact Number
                <span className="text-red-600"> *</span>
              </label>

              <input
                type="tel"
                value={booking.deceased.informant.contactNumber}
                onChange={(e) =>
                  updateInformant("contactNumber", e.target.value)
                }
                readOnly={readOnly}
                className={inputClass}
                placeholder="09XX XXX XXXX"
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
                  booking.deceased.informant.dateProvided
                    ?.toISOString()
                    .split("T")[0] ?? ""
                }
                onChange={(e) =>
                  updateInformant(
                    "dateProvided",
                    e.target.value ? new Date(e.target.value) : null,
                  )
                }
                readOnly={readOnly}
                className={inputClass}
              />
            </div>
          </div>
        </section>
      </BookingCard>

      <BookingCard title="Requirements">
        <form className="space-y-8">
          <section>
            <h3 className="mb-2 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Attach Soft Copy of Requirements
            </h3>

            <p className="mb-6 text-sm text-gray-500">
              Upload clear scanned copies or photos of the required documents.
              Accepted formats are PDF, JPG, JPEG, and PNG (maximum 5 MB per
              file).
            </p>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Death Certificate"
                  required
                  file={booking.requirements.deathCertificate}
                  onChange={(file) =>
                    updateRequirement("deathCertificate", file)
                  }
                  readOnly={readOnly}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FileUploadField
                  label="Biography of the Deceased"
                  required
                  file={booking.requirements.biography}
                  onChange={(file) => updateRequirement("biography", file)}
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
