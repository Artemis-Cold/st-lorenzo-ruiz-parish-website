import { BookingCard } from "../..";
import { Plus, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import FileUploadField from "../summary/FileUploadField";
import type {
  Baptizand,
  Parent,
  GodParent,
  BaptismBooking,
  BaptismDocument,
} from "../../../../types/baptism";

interface DetailsStepProps {
  booking: BaptismBooking;
  setBooking: Dispatch<SetStateAction<BaptismBooking>>;
  readOnly?: boolean;
  errors?: Record<string, string[]>;
  view?: "all" | "information" | "documents";
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
  view = "all",
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

  const removeGodParent = (index: number) => {
    setBooking((prev) => ({
      ...prev,
      god_parents: prev.god_parents.filter((_, i) => i !== index),
    }));
  };

  const addGodParent = () => {
    setBooking((prev) => ({
      ...prev,
      god_parents: [
        ...prev.god_parents,
        {
          role: "",
          first_name: "",
          last_name: "",
          middle_initial: "",
          residence: "",
          requirement_type: "",
          requirement_file: null,
        },
      ],
    }));
  };

  const updateGodParent = <K extends keyof GodParent>(
    index: number,
    field: K,
    value: GodParent[K],
  ) => {
    setBooking((prev) => ({
      ...prev,
      god_parents: prev.god_parents.map((godParent, i) =>
        i === index ? { ...godParent, [field]: value } : godParent,
      ),
    }));
  };

  const godParentName = (godParent: GodParent) =>
    [
      godParent.first_name,
      godParent.middle_initial
        ? `${godParent.middle_initial.replace(/\.$/, "")}.`
        : "",
      godParent.last_name,
    ]
      .filter(Boolean)
      .join(" ");

  const renderGodParentRequirement = (godParent: GodParent, index: number) => (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h5 className="font-semibold text-amber-950">
            Godparent {index + 1}
            {godParentName(godParent) ? `: ${godParentName(godParent)}` : ""}
          </h5>
          <p className="mt-0.5 text-xs font-medium text-amber-700">
            {godParent.role === "godfather"
              ? "Godfather (Ninong)"
              : godParent.role === "godmother"
                ? "Godmother (Ninang)"
                : "Godparent role not selected"}
          </p>
        </div>
        {!godParent.requirement_file && (
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
            const selected = godParent.requirement_type === type;

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
                  name={`godparent-requirement-${index}`}
                  value={type}
                  checked={selected}
                  disabled={readOnly}
                  onChange={() => {
                    updateGodParent(index, "requirement_type", type);
                    if (godParent.requirement_type !== type) {
                      updateGodParent(index, "requirement_file", null);
                    }
                  }}
                  className="size-4 accent-[#B22222]"
                />
                {label}
              </label>
            );
          })}
        </div>
        <FieldError
          message={getError(`god_parents.${index}.requirement_type`)}
        />
      </fieldset>

      {godParent.requirement_type && (
        <div className="mt-4 min-w-0">
          <FileUploadField
            label={`${
              godParent.requirement_type === "marriage_contract"
                ? "Marriage Certificate"
                : "Confirmation Certificate"
            } PDF`}
            file={godParent.requirement_file}
            onChange={(file) =>
              updateGodParent(index, "requirement_file", file)
            }
            accept=".pdf"
            readOnly={readOnly}
          />
          <FieldError
            message={getError(`god_parents.${index}.requirement_file`)}
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
      {view !== "documents" && (
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
                    onChange={(e) =>
                      updateBaptizand("last_name", e.target.value)
                    }
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
                    className={inputClass(
                      !!getError("baptizand.middle_initial"),
                    )}
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
                        ? booking.baptizand.birth_date
                            .toISOString()
                            .split("T")[0]
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
                    className={inputClass(
                      !!getError("baptizand.contact_number"),
                    )}
                  />
                  <FieldError message={getError("baptizand.contact_number")} />
                </div>
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between gap-4 border-b pb-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#B22222]">
                    Sponsors / Godparents
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add godparents individually and identify each one as a
                    godfather or godmother. Each godparent submits an individual
                    supporting certificate.
                  </p>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={addGodParent}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#B22222] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#8B1C1C]"
                  >
                    <Plus size={16} /> Add Godparent
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  {booking.god_parents.map((godParent, godParentIndex) => (
                    <div
                      key={godParentIndex}
                      className="rounded-xl bg-gray-50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h5 className="font-semibold text-gray-700">
                          Godparent {godParentIndex + 1}
                        </h5>
                        {!readOnly && booking.god_parents.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeGodParent(godParentIndex)}
                            aria-label={`Remove godparent ${
                              godParentIndex + 1
                            }`}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12">
                          <label className="mb-1.5 block text-sm font-medium">
                            Godparent Role{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <select
                            value={godParent.role}
                            onChange={(event) =>
                              updateGodParent(
                                godParentIndex,
                                "role",
                                event.target.value as GodParent["role"],
                              )
                            }
                            disabled={readOnly}
                            className={inputClass(
                              !!getError(`god_parents.${godParentIndex}.role`),
                            )}
                          >
                            <option value="">Select godparent role</option>
                            <option value="godfather">
                              Godfather (Ninong)
                            </option>
                            <option value="godmother">
                              Godmother (Ninang)
                            </option>
                          </select>
                          <FieldError
                            message={getError(
                              `god_parents.${godParentIndex}.role`,
                            )}
                          />
                        </div>

                        <div className="col-span-12 sm:col-span-5">
                          <label className="mb-1.5 block text-sm font-medium">
                            Last Name <span className="text-red-600">*</span>
                          </label>
                          <input
                            value={godParent.last_name}
                            onChange={(event) =>
                              updateGodParent(
                                godParentIndex,
                                "last_name",
                                event.target.value,
                              )
                            }
                            readOnly={readOnly}
                            placeholder="Last name"
                            className={inputClass(
                              !!getError(
                                `god_parents.${godParentIndex}.last_name`,
                              ),
                            )}
                          />
                          <FieldError
                            message={getError(
                              `god_parents.${godParentIndex}.last_name`,
                            )}
                          />
                        </div>

                        <div className="col-span-12 sm:col-span-5">
                          <label className="mb-1.5 block text-sm font-medium">
                            First Name <span className="text-red-600">*</span>
                          </label>
                          <input
                            value={godParent.first_name}
                            onChange={(event) =>
                              updateGodParent(
                                godParentIndex,
                                "first_name",
                                event.target.value,
                              )
                            }
                            readOnly={readOnly}
                            placeholder="First name"
                            className={inputClass(
                              !!getError(
                                `god_parents.${godParentIndex}.first_name`,
                              ),
                            )}
                          />
                          <FieldError
                            message={getError(
                              `god_parents.${godParentIndex}.first_name`,
                            )}
                          />
                        </div>

                        <div className="col-span-12 sm:col-span-2">
                          <label className="mb-1.5 block text-sm font-medium">
                            MI
                          </label>
                          <input
                            maxLength={1}
                            value={godParent.middle_initial}
                            onChange={(event) =>
                              updateGodParent(
                                godParentIndex,
                                "middle_initial",
                                event.target.value,
                              )
                            }
                            readOnly={readOnly}
                            placeholder="M"
                            className={inputClass(
                              !!getError(
                                `god_parents.${godParentIndex}.middle_initial`,
                              ),
                            )}
                          />
                          <FieldError
                            message={getError(
                              `god_parents.${godParentIndex}.middle_initial`,
                            )}
                          />
                        </div>

                        <div className="col-span-12">
                          <label className="mb-1.5 block text-sm font-medium">
                            Residence <span className="text-red-600">*</span>
                          </label>
                          <input
                            value={godParent.residence}
                            onChange={(event) =>
                              updateGodParent(
                                godParentIndex,
                                "residence",
                                event.target.value,
                              )
                            }
                            readOnly={readOnly}
                            placeholder="Complete residence"
                            className={inputClass(
                              !!getError(
                                `god_parents.${godParentIndex}.residence`,
                              ),
                            )}
                          />
                          <FieldError
                            message={getError(
                              `god_parents.${godParentIndex}.residence`,
                            )}
                          />
                        </div>
                      </div>

                      {view === "all" && (
                        <div className="mt-5">
                          {renderGodParentRequirement(
                            godParent,
                            godParentIndex,
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {errors?.god_parents?.[0] && (
                  <FieldError message={errors.god_parents[0]} />
                )}
              </div>
            </section>
          </form>
        </BookingCard>
      )}

      {view !== "information" && (
        <BookingCard title="Requirements">
          <form className="space-y-8">
            <section>
              <h3 className="mb-2 border-b pb-2 text-lg font-semibold text-[#B22222]">
                Attach Soft Copy of Requirements
              </h3>

              <p className="mb-6 text-sm text-gray-500">
                Upload the files you currently have. Missing requirements may be
                submitted later from My Profile while the booking remains
                pending.
              </p>

              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12">
                  <FileUploadField
                    label="Birth Certificate of the Child"
                    file={getDocument("birth_certificate")}
                    onChange={(file) =>
                      updateDocument("birth_certificate", file)
                    }
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
                  <h4 className="font-semibold text-blue-800">
                    Baptism Permit
                  </h4>

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

            {view === "all" ? (
              <section className="rounded-2xl border border-green-200 bg-green-50 p-5">
                <h3 className="mb-2 font-semibold text-green-800">
                  Godparent Requirements
                </h3>
                <p className="text-sm text-green-700">
                  Each godparent's selected Marriage or Confirmation Certificate
                  is shown with their personal information above.
                </p>
              </section>
            ) : (
              <section className="space-y-5">
                <div>
                  <h3 className="border-b pb-2 text-lg font-semibold text-[#B22222]">
                    Godparent Requirements
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Select one certificate type for every godparent, then upload
                    that person's PDF. Missing files may be submitted later from
                    My Profile.
                  </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {booking.god_parents.map((godParent, godParentIndex) => (
                    <div key={godParentIndex} className="min-w-0">
                      {renderGodParentRequirement(godParent, godParentIndex)}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </form>
        </BookingCard>
      )}
    </>
  );
}
