import { BookingCard } from "../..";
import type { BaptismBooking } from "../../../../types/baptism";
import type { Dispatch, SetStateAction } from "react";
import type {
  Baptizand,
  Parent,
  GodParent,
  GodParentPair,
} from "../../../../types/person";
import FileUploadField from "../summary/FileUploadField";

interface DetailsStepProps {
  booking: BaptismBooking;
  setBooking: Dispatch<SetStateAction<BaptismBooking>>;
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

  const updateFather = <K extends keyof Parent>(field: K, value: Parent[K]) => {
    setBooking((prev) => ({
      ...prev,
      baptizand: {
        ...prev.baptizand,
        father: {
          ...prev.baptizand.father,
          [field]: value,
        },
      },
    }));
  };

  const updateMother = <K extends keyof Parent>(field: K, value: Parent[K]) => {
    setBooking((prev) => ({
      ...prev,
      baptizand: {
        ...prev.baptizand,
        mother: {
          ...prev.baptizand.mother,
          [field]: value,
        },
      },
    }));
  };

  const removeGodParentPair = (index: number) => {
    setBooking((prev) => ({
      ...prev,
      baptizand: {
        ...prev.baptizand,
        godParents: prev.baptizand.godParents.filter((_, i) => i !== index),
      },
    }));
  };

  const addGodParentPair = () => {
    setBooking((prev) => ({
      ...prev,
      baptizand: {
        ...prev.baptizand,
        godParents: [
          ...prev.baptizand.godParents,
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
    }));
  };

  const updateGodParent = (
    index: number,
    role: "godFather" | "godMother",
    field: keyof GodParent,
    value: string,
  ) => {
    setBooking((prev) => ({
      ...prev,
      baptizand: {
        ...prev.baptizand,
        godParents: prev.baptizand.godParents.map((pair, i) =>
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
      },
    }));
  };

  const updateGodParentRequirement = (
    index: number,
    field: keyof GodParentPair["requirements"],
    file: File | null,
  ) => {
    setBooking((prev) => ({
      ...prev,
      baptizand: {
        ...prev.baptizand,
        godParents: prev.baptizand.godParents.map((pair, i) =>
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
      },
    }));
  };

  const updateRequirement = (
    field: keyof BaptismBooking["requirements"],
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
                  value={booking.baptizand.lastName}
                  onChange={(e) => updateBaptizand("lastName", e.target.value)}
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
                  value={booking.baptizand.firstName}
                  onChange={(e) => updateBaptizand("firstName", e.target.value)}
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
                  value={booking.baptizand.middleInitial}
                  onChange={(e) =>
                    updateBaptizand("middleInitial", e.target.value)
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
                  value={booking.baptizand.address}
                  onChange={(e) => updateBaptizand("address", e.target.value)}
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
                  value={booking.baptizand.age ?? ""}
                  onChange={(e) =>
                    updateBaptizand(
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
                    booking.baptizand.birthDate
                      ? booking.baptizand.birthDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    updateBaptizand(
                      "birthDate",
                      e.target.value ? new Date(e.target.value) : null,
                    )
                  }
                  readOnly={readOnly}
                  className={inputClass}
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="mb-2 block text-sm font-medium">
                  Place of Birth<span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  value={booking.baptizand.birthPlace}
                  onChange={(e) =>
                    updateBaptizand("birthPlace", e.target.value)
                  }
                  placeholder="Place of Birth"
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
                  value={booking.baptizand.father.lastName}
                  onChange={(e) => updateFather("lastName", e.target.value)}
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
                  value={booking.baptizand.father.firstName}
                  onChange={(e) => updateFather("firstName", e.target.value)}
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
                  value={booking.baptizand.father.middleInitial}
                  onChange={(e) =>
                    updateFather("middleInitial", e.target.value)
                  }
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
                  className={inputClass}
                  value={booking.baptizand.father.birthPlace}
                  onChange={(e) => updateFather("birthPlace", e.target.value)}
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
                  className={inputClass}
                  value={booking.baptizand.mother.lastName}
                  onChange={(e) => updateMother("lastName", e.target.value)}
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
                  value={booking.baptizand.mother.firstName}
                  onChange={(e) => updateMother("firstName", e.target.value)}
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
                  value={booking.baptizand.mother.middleInitial}
                  onChange={(e) =>
                    updateMother("middleInitial", e.target.value)
                  }
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
                  className={inputClass}
                  value={booking.baptizand.mother.birthPlace}
                  onChange={(e) => updateMother("birthPlace", e.target.value)}
                />
              </div>

              <div className="col-span-12">
                <label className="mb-2 block text-sm font-medium">
                  Contact Number <span className="text-red-600">*</span>
                </label>

                <input
                  type="tel"
                  value={booking.baptizand.contactNumber}
                  onChange={(e) =>
                    updateBaptizand("contactNumber", e.target.value)
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
              Sponsors / Godparents
            </h3>

            <div className="space-y-8">
              {booking.baptizand.godParents.map((pair, index) => (
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
                            value={pair.godFather.lastName}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "godFather",
                                "lastName",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass}
                            placeholder="Enter last name of godfather"
                          />
                        </div>

                        <div className="col-span-12 md:col-span-5">
                          <label className="mb-2 block text-sm font-medium">
                            First Name
                          </label>

                          <input
                            type="text"
                            value={pair.godFather.firstName}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "godFather",
                                "firstName",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass}
                            placeholder="Enter first name of godfather"
                          />
                        </div>

                        <div className="col-span-12 md:col-span-2">
                          <label className="mb-2 block text-sm font-medium">
                            MI
                          </label>

                          <input
                            type="text"
                            maxLength={1}
                            value={pair.godFather.middleInitial}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "godFather",
                                "middleInitial",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass}
                            placeholder="M"
                          />
                        </div>

                        <div className="col-span-12">
                          <label className="mb-2 block text-sm font-medium">
                            Residence
                          </label>

                          <input
                            type="text"
                            value={pair.godFather.residence}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "godFather",
                                "residence",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass}
                            placeholder="Enter residence of godfather"
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
                            value={pair.godMother.lastName}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "godMother",
                                "lastName",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass}
                            placeholder="Enter last name of godmother"
                          />
                        </div>

                        <div className="col-span-12 md:col-span-5">
                          <label className="mb-2 block text-sm font-medium">
                            First Name
                          </label>

                          <input
                            type="text"
                            value={pair.godMother.firstName}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "godMother",
                                "firstName",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass}
                            placeholder="Enter first name of godmother"
                          />
                        </div>

                        <div className="col-span-12 md:col-span-2">
                          <label className="mb-2 block text-sm font-medium">
                            MI
                          </label>

                          <input
                            type="text"
                            maxLength={1}
                            value={pair.godMother.middleInitial}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "godMother",
                                "middleInitial",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass}
                            placeholder="M"
                          />
                        </div>

                        <div className="col-span-12">
                          <label className="mb-2 block text-sm font-medium">
                            Residence
                          </label>

                          <input
                            type="text"
                            value={pair.godMother.residence}
                            onChange={(e) =>
                              updateGodParent(
                                index,
                                "godMother",
                                "residence",
                                e.target.value,
                              )
                            }
                            readOnly={readOnly}
                            className={inputClass}
                            placeholder="Enter residence of godmother"
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
                                  file={pair.requirements.marriageContract}
                                  onChange={(file) =>
                                    updateGodParentRequirement(
                                      index,
                                      "marriageContract",
                                      file,
                                    )
                                  }
                                  readOnly={readOnly}
                                />
                              </div>

                              <div className="col-span-12 md:col-span-6">
                                <FileUploadField
                                  label="Confirmation Certificate"
                                  file={
                                    pair.requirements.confirmationCertificate
                                  }
                                  onChange={(file) =>
                                    updateGodParentRequirement(
                                      index,
                                      "confirmationCertificate",
                                      file,
                                    )
                                  }
                                  readOnly={readOnly}
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
              Upload clear scanned copies or photos of the required documents.
              Accepted formats are PDF, JPG, JPEG, and PNG (maximum 5 MB per
              file).
            </p>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12">
                <FileUploadField
                  label="Birth Certificate of the Child"
                  required
                  file={booking.requirements.birthCertificate}
                  onChange={(file) =>
                    updateRequirement("birthCertificate", file)
                  }
                  readOnly={readOnly}
                />
              </div>

              <div className="col-span-12 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h4 className="font-semibold text-blue-800">Baptism Permit</h4>

                <p className="mt-1 text-sm text-blue-700">
                  Required only for applicants who are
                  <strong> not under the parish jurisdiction.</strong>
                  This document may be obtained from the applicant's parish of
                  origin.
                </p>
              </div>

              <div className="col-span-12">
                <FileUploadField
                  label="Baptism Permit"
                  file={booking.requirements.baptismPermit}
                  onChange={(file) => updateRequirement("baptismPermit", file)}
                  readOnly={readOnly}
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
                  file={booking.requirements.noRecordCert}
                  onChange={(file) => updateRequirement("noRecordCert", file)}
                  readOnly={readOnly}
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
              <strong> (Marriage Contract or Confirmation Certificate)</strong>
              is uploaded together with each Godparent Pair above. No additional
              upload is required in this section.
            </p>
          </section>
        </form>
      </BookingCard>
    </>
  );
}
