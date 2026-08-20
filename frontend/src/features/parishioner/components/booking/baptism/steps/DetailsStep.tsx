import { BookingCard } from "../..";
import type { Dispatch, SetStateAction } from "react";
import FileUploadField from "../summary/FileUploadField";
import type {
  Baptizand,
  Parent,
  GodParent,
  GodParentPair,
  BaptismBooking,
  BaptismDocument,
} from "../../../../types/baptism";

interface DetailsStepProps {
  booking: BaptismBooking;
  setBooking: Dispatch<SetStateAction<BaptismBooking>>;
  readOnly?: boolean;
  errors?: Record<string, string[]>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export default function DetailsStep({
  booking,
  setBooking,
  readOnly,
  errors,
}: DetailsStepProps) {
  const getError = (key: string): string | undefined => errors?.[key]?.[0];

  const inputClass = (hasError?: boolean) => `
w-full rounded-xl border px-4 py-3 transition
${
  readOnly
    ? "border-gray-200 bg-gray-50 text-gray-700"
    : hasError
      ? "border-red-400 bg-white focus:border-red-500 focus:outline-none"
      : "border-gray-300 bg-white focus:border-[#B22222] focus:outline-none"
}
`;

  const updateBaptizand = <K extends keyof Baptizand>(
    field: K,
    value: Baptizand[K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      baptizand: {
        ...prev.baptizand,
        [field]: value,
      },
    }));
  };

  const fatherIndex = booking.parents.findIndex(
    (p) => p.relationship === "father",
  );
  const motherIndex = booking.parents.findIndex(
    (p) => p.relationship === "mother",
  );
  const father = booking.parents[fatherIndex];
  const mother = booking.parents[motherIndex];

  const updateParent = (
    relationship: "father" | "mother",
    field: keyof Omit<Parent, "relationship">,
    value: string,
  ) => {
    setBooking((prev) => ({
      ...prev,
      parents: prev.parents.map((p) =>
        p.relationship === relationship ? { ...p, [field]: value } : p,
      ),
    }));
  };

  const removeGodParentPair = (index: number) => {
    setBooking((prev) => ({
      ...prev,
      god_parents: prev.god_parents.filter((_, i) => i !== index),
    }));
  };

  const addGodParentPair = () => {
    setBooking((prev) => ({
      ...prev,
      god_parents: [
        ...prev.god_parents,
        {
          god_father: {
            role: "godfather",
            first_name: "",
            last_name: "",
            middle_initial: "",
            residence: "",
          },
          god_mother: {
            role: "godmother",
            first_name: "",
            last_name: "",
            middle_initial: "",
            residence: "",
          },
          requirements: {
            marriage_contract: null,
            confirmation_certificate: null,
          },
        },
      ],
    }));
  };

  const updateGodParent = (
    index: number,
    role: "god_father" | "god_mother",
    field: keyof Omit<GodParent, "role">,
    value: string,
  ) => {
    setBooking((prev) => ({
      ...prev,
      god_parents: prev.god_parents.map((pair, i) =>
        i === index
          ? {
              ...pair,
              [role]: {
                ...pair[role],
                [field]: value,
              },
            }
          : pair,
      ),
    }));
  };

  const updateGodParentRequirement = (
    index: number,
    field: keyof GodParentPair["requirements"],
    file: File | null,
  ) => {
    setBooking((prev) => ({
      ...prev,
      god_parents: prev.god_parents.map((pair, i) =>
        i === index
          ? {
              ...pair,
              requirements: {
                ...pair.requirements,
                [field]: file,
              },
            }
          : pair,
      ),
    }));
  };

  // ---- Documents ----
  const getDocumentIndex = (type: BaptismDocument["document_type"]) =>
    booking.documents.findIndex((d) => d.document_type === type);

  const getDocument = (type: BaptismDocument["document_type"]) =>
    booking.documents.find((d) => d.document_type === type)?.file ?? null;

  const updateDocument = (
    type: BaptismDocument["document_type"],
    file: File | null,
  ) => {
    setBooking((prev) => ({
      ...prev,
      documents: file
        ? [
            ...prev.documents.filter((d) => d.document_type !== type),
            { document_type: type, file },
          ]
        : prev.documents.filter((d) => d.document_type !== type),
    }));
  };

  return (
    <>
      <BookingCard title="Baptizand's Information">
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
                  value={booking.baptizand.last_name}
                  onChange={(e) => updateBaptizand("last_name", e.target.value)}
                  placeholder="Enter last name"
                  readOnly={readOnly}
                  className={inputClass(!!getError("baptizand.last_name"))}
                />
                <FieldError message={getError("baptizand.last_name")} />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  First Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.baptizand.first_name}
                  onChange={(e) =>
                    updateBaptizand("first_name", e.target.value)
                  }
                  placeholder="Enter first name"
                  readOnly={readOnly}
                  className={inputClass(!!getError("baptizand.first_name"))}
                />
                <FieldError message={getError("baptizand.first_name")} />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="mb-2 block text-sm font-medium">MI</label>

                <input
                  type="text"
                  maxLength={1}
                  value={booking.baptizand.middle_initial}
                  onChange={(e) =>
                    updateBaptizand("middle_initial", e.target.value)
                  }
                  placeholder="M"
                  readOnly={readOnly}
                  className={inputClass(!!getError("baptizand.middle_initial"))}
                />
                <FieldError message={getError("baptizand.middle_initial")} />
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="mb-2 block text-sm font-medium">
                  Gender <span className="text-red-600">*</span>
                </label>

                <select
                  value={booking.baptizand.gender}
                  onChange={(e) =>
                    updateBaptizand(
                      "gender",
                      e.target.value as Baptizand["gender"],
                    )
                  }
                  disabled={readOnly}
                  className={inputClass(!!getError("baptizand.gender"))}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <FieldError message={getError("baptizand.gender")} />
              </div>

              <div className="col-span-12 md:col-span-8">
                <label className="mb-2 block text-sm font-medium">
                  Address <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.baptizand.address}
                  onChange={(e) => updateBaptizand("address", e.target.value)}
                  placeholder="Street, Barangay, Municipality/City"
                  readOnly={readOnly}
                  className={inputClass(!!getError("baptizand.address"))}
                />
                <FieldError message={getError("baptizand.address")} />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Birthday <span className="text-red-600">*</span>
                </label>

                <input
                  type="date"
                  value={
                    booking.baptizand.birth_date
                      ? booking.baptizand.birth_date.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    updateBaptizand(
                      "birth_date",
                      e.target.value ? new Date(e.target.value) : null,
                    )
                  }
                  readOnly={readOnly}
                  className={inputClass(!!getError("baptizand.birth_date"))}
                />
                <FieldError message={getError("baptizand.birth_date")} />
              </div>

              <div className="col-span-12 md:col-span-7">
                <label className="mb-2 block text-sm font-medium">
                  Place of Birth<span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.baptizand.birth_place ?? ""}
                  onChange={(e) =>
                    updateBaptizand("birth_place", e.target.value)
                  }
                  placeholder="Place of Birth"
                  readOnly={readOnly}
                  className={inputClass(!!getError("baptizand.birth_place"))}
                />
                <FieldError message={getError("baptizand.birth_place")} />
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
                  className={inputClass(
                    !!getError(`parents.${fatherIndex}.last_name`),
                  )}
                  value={father?.last_name ?? ""}
                  onChange={(e) =>
                    updateParent("father", "last_name", e.target.value)
                  }
                />
                <FieldError
                  message={getError(`parents.${fatherIndex}.last_name`)}
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
                  className={inputClass(
                    !!getError(`parents.${fatherIndex}.first_name`),
                  )}
                  value={father?.first_name ?? ""}
                  onChange={(e) =>
                    updateParent("father", "first_name", e.target.value)
                  }
                />
                <FieldError
                  message={getError(`parents.${fatherIndex}.first_name`)}
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
                  className={inputClass(
                    !!getError(`parents.${fatherIndex}.middle_initial`),
                  )}
                  value={father?.middle_initial ?? ""}
                  onChange={(e) =>
                    updateParent("father", "middle_initial", e.target.value)
                  }
                />
                <FieldError
                  message={getError(`parents.${fatherIndex}.middle_initial`)}
                />
              </div>

              <div className="col-span-12">
                <label className="mb-2 block text-sm font-medium">
                  Father's Place of Birth{" "}
                  <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Place of Birth"
                  readOnly={readOnly}
                  className={inputClass(
                    !!getError(`parents.${fatherIndex}.birth_place`),
                  )}
                  value={father?.birth_place ?? ""}
                  onChange={(e) =>
                    updateParent("father", "birth_place", e.target.value)
                  }
                />
                <FieldError
                  message={getError(`parents.${fatherIndex}.birth_place`)}
                />
              </div>

              <div className="col-span-12 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  <strong>Reminder:</strong> Please enter the mother's maiden
                  name (surname before marriage).
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
                  className={inputClass(
                    !!getError(`parents.${motherIndex}.last_name`),
                  )}
                  value={mother?.last_name ?? ""}
                  onChange={(e) =>
                    updateParent("mother", "last_name", e.target.value)
                  }
                />
                <FieldError
                  message={getError(`parents.${motherIndex}.last_name`)}
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
                  className={inputClass(
                    !!getError(`parents.${motherIndex}.first_name`),
                  )}
                  value={mother?.first_name ?? ""}
                  onChange={(e) =>
                    updateParent("mother", "first_name", e.target.value)
                  }
                />
                <FieldError
                  message={getError(`parents.${motherIndex}.first_name`)}
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
                  className={inputClass(
                    !!getError(`parents.${motherIndex}.middle_initial`),
                  )}
                  value={mother?.middle_initial ?? ""}
                  onChange={(e) =>
                    updateParent("mother", "middle_initial", e.target.value)
                  }
                />
                <FieldError
                  message={getError(`parents.${motherIndex}.middle_initial`)}
                />
              </div>

              <div className="col-span-12">
                <label className="mb-2 block text-sm font-medium">
                  Mother's Place of Birth{" "}
                  <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Place of Birth"
                  readOnly={readOnly}
                  className={inputClass(
                    !!getError(`parents.${motherIndex}.birth_place`),
                  )}
                  value={mother?.birth_place ?? ""}
                  onChange={(e) =>
                    updateParent("mother", "birth_place", e.target.value)
                  }
                />
                <FieldError
                  message={getError(`parents.${motherIndex}.birth_place`)}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="mb-2 block text-sm font-medium">
                  Contact Number <span className="text-red-600">*</span>
                </label>

                <input
                  type="tel"
                  value={booking.baptizand.contact_number ?? ""}
                  onChange={(e) =>
                    updateBaptizand("contact_number", e.target.value)
                  }
                  placeholder="09XX XXX XXXX"
                  readOnly={readOnly}
                  className={inputClass(!!getError("baptizand.contact_number"))}
                />
                <FieldError message={getError("baptizand.contact_number")} />
              </div>

            </div>
          </section>

          <section>
            <h3 className="mb-5 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Sponsors / Godparents
            </h3>

            <div className="space-y-8">
              {booking.god_parents.map((pair, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 p-6"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h4 className="font-semibold text-[#B22222]">
                      Godparent Pair #{index + 1}
                    </h4>

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => removeGodParentPair(index)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Remove Pair
                      </button>
                    )}
                  </div>

                  <div className="space-y-8">
                    {/* GODFATHER */}
                    <div>
                      <h5 className="mb-4 font-semibold text-gray-700">
                        Godfather (Ninong)
                      </h5>

                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-5">
                          <label className="mb-2 block text-sm font-medium">
                            Last Name
                          </label>

                          <input
                            type="text"
                            value={pair.god_father.last_name}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "god_father",
                                "last_name",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass(
                              !!getError(
                                `god_parents.${index}.god_father.last_name`,
                              ),
                            )}
                            placeholder="Enter last name of godfather"
                          />
                          <FieldError
                            message={getError(
                              `god_parents.${index}.god_father.last_name`,
                            )}
                          />
                        </div>

                        <div className="col-span-12 md:col-span-5">
                          <label className="mb-2 block text-sm font-medium">
                            First Name
                          </label>

                          <input
                            type="text"
                            value={pair.god_father.first_name}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "god_father",
                                "first_name",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass(
                              !!getError(
                                `god_parents.${index}.god_father.first_name`,
                              ),
                            )}
                            placeholder="Enter first name of godfather"
                          />
                          <FieldError
                            message={getError(
                              `god_parents.${index}.god_father.first_name`,
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
                            value={pair.god_father.middle_initial}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "god_father",
                                "middle_initial",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass(
                              !!getError(
                                `god_parents.${index}.god_father.middle_initial`,
                              ),
                            )}
                            placeholder="M"
                          />
                          <FieldError
                            message={getError(
                              `god_parents.${index}.god_father.middle_initial`,
                            )}
                          />
                        </div>

                        <div className="col-span-12">
                          <label className="mb-2 block text-sm font-medium">
                            Residence
                          </label>

                          <input
                            type="text"
                            value={pair.god_father.residence}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "god_father",
                                "residence",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass(
                              !!getError(
                                `god_parents.${index}.god_father.residence`,
                              ),
                            )}
                            placeholder="Enter residence of godfather"
                          />
                          <FieldError
                            message={getError(
                              `god_parents.${index}.god_father.residence`,
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* GODMOTHER */}
                    <div>
                      <h5 className="mb-4 font-semibold text-gray-700">
                        Godmother (Ninang)
                      </h5>

                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-5">
                          <label className="mb-2 block text-sm font-medium">
                            Last Name
                          </label>

                          <input
                            type="text"
                            value={pair.god_mother.last_name}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "god_mother",
                                "last_name",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass(
                              !!getError(
                                `god_parents.${index}.god_mother.last_name`,
                              ),
                            )}
                            placeholder="Enter last name of godmother"
                          />
                          <FieldError
                            message={getError(
                              `god_parents.${index}.god_mother.last_name`,
                            )}
                          />
                        </div>

                        <div className="col-span-12 md:col-span-5">
                          <label className="mb-2 block text-sm font-medium">
                            First Name
                          </label>

                          <input
                            type="text"
                            value={pair.god_mother.first_name}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "god_mother",
                                "first_name",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass(
                              !!getError(
                                `god_parents.${index}.god_mother.first_name`,
                              ),
                            )}
                            placeholder="Enter first name of godmother"
                          />
                          <FieldError
                            message={getError(
                              `god_parents.${index}.god_mother.first_name`,
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
                            value={pair.god_mother.middle_initial}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "god_mother",
                                "middle_initial",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass(
                              !!getError(
                                `god_parents.${index}.god_mother.middle_initial`,
                              ),
                            )}
                            placeholder="M"
                          />
                          <FieldError
                            message={getError(
                              `god_parents.${index}.god_mother.middle_initial`,
                            )}
                          />
                        </div>

                        <div className="col-span-12">
                          <label className="mb-2 block text-sm font-medium">
                            Residence
                          </label>

                          <input
                            type="text"
                            value={pair.god_mother.residence}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "god_mother",
                                "residence",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass(
                              !!getError(
                                `god_parents.${index}.god_mother.residence`,
                              ),
                            )}
                            placeholder="Enter residence of godmother"
                          />
                          <FieldError
                            message={getError(
                              `god_parents.${index}.god_mother.residence`,
                            )}
                          />
                        </div>

                        {/* SPONSOR REQUIREMENTS */}
                        <div className="col-span-12">
                          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-5">
                            <h5 className="mb-2 font-semibold text-amber-800">
                              Sponsor Requirements
                            </h5>

                            <p className="mb-5 text-sm text-amber-700">
                              Upload <strong>either</strong> the Marriage
                              Contract
                              <strong> or </strong>
                              the Confirmation Certificate of the godparents.
                            </p>

                            <div className="grid grid-cols-12 gap-5">
                              <div className="col-span-12 md:col-span-6">
                                <FileUploadField
                                  label="Marriage Contract"
                                  file={pair.requirements.marriage_contract}
                                  onChange={(file) =>
                                    updateGodParentRequirement(
                                      index,
                                      "marriage_contract",
                                      file,
                                    )
                                  }
                                  readOnly={readOnly}
                                />
                                <FieldError
                                  message={getError(
                                    `god_parents.${index}.requirements.marriage_contract`,
                                  )}
                                />
                              </div>

                              <div className="col-span-12 md:col-span-6">
                                <FileUploadField
                                  label="Confirmation Certificate"
                                  file={
                                    pair.requirements.confirmation_certificate
                                  }
                                  onChange={(file) =>
                                    updateGodParentRequirement(
                                      index,
                                      "confirmation_certificate",
                                      file,
                                    )
                                  }
                                  readOnly={readOnly}
                                />
                                <FieldError
                                  message={getError(
                                    `god_parents.${index}.requirements.confirmation_certificate`,
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!readOnly && (
                <button
                  type="button"
                  onClick={addGodParentPair}
                  className="rounded-xl bg-[#B22222] px-5 py-3 font-medium text-white transition hover:bg-[#8B1C1C]"
                >
                  + Add Godparent Pair
                </button>
              )}
            </div>
          </section>
        </form>
      </BookingCard>

      <BookingCard title="Requirements">
        <form className="space-y-8">
          <section>
            <h3 className="mb-2 border-b pb-2 text-lg font-semibold text-[#B22222]">
              Attach Soft Copy of Requirements
            </h3>

            <p className="mb-6 text-sm text-gray-500">
              Upload the files you currently have. Missing requirements may be
              submitted later from My Profile while the booking remains pending.
            </p>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12">
                <FileUploadField
                  label="Birth Certificate of the Child"
                  file={getDocument("birth_certificate")}
                  onChange={(file) => updateDocument("birth_certificate", file)}
                  readOnly={readOnly}
                />
                <FieldError
                  message={
                    getError("documents.birth_certificate") ??
                    getError(
                      `documents.${getDocumentIndex("birth_certificate")}.file`,
                    )
                  }
                />
              </div>

              <div className="col-span-12 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h4 className="font-semibold text-blue-800">Baptism Permit</h4>

                <p className="mt-1 text-sm text-blue-700">
                  Required only for applicants who are
                  <strong> not under the parish jurisdiction. </strong>
                  This document may be obtained from the applicant's parish of
                  origin.
                </p>
              </div>

              <div className="col-span-12">
                <FileUploadField
                  label="Baptism Permit"
                  file={getDocument("baptism_permit")}
                  onChange={(file) => updateDocument("baptism_permit", file)}
                  readOnly={readOnly}
                />
                <FieldError
                  message={getError(
                    `documents.${getDocumentIndex("baptism_permit")}.file`,
                  )}
                />
              </div>

              <div className="col-span-12 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h4 className="font-semibold text-amber-800">
                  Certificate of No Record of Baptism
                </h4>

                <p className="mt-1 text-sm text-amber-700">
                  Required only for
                  <strong> adult baptism (7 years old and above).</strong>
                </p>
              </div>

              <div className="col-span-12">
                <FileUploadField
                  label="Certificate of No Record of Baptism"
                  file={getDocument("no_record_certificate")}
                  onChange={(file) =>
                    updateDocument("no_record_certificate", file)
                  }
                  readOnly={readOnly}
                />
                <FieldError
                  message={
                    getError("documents.no_record_certificate") ??
                    getError(
                      `documents.${getDocumentIndex("no_record_certificate")}.file`,
                    )
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <h3 className="mb-2 font-semibold text-green-800">
              Sponsor Requirements
            </h3>

            <p className="text-sm text-green-700">
              The required document for each pair of godparents
              <strong> (Marriage Contract or Confirmation Certificate) </strong>
              is uploaded together with each Godparent Pair above. No additional
              upload is required in this section.
            </p>
          </section>
        </form>
      </BookingCard>
    </>
  );
}
