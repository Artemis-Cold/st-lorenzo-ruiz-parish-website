import type { Dispatch, SetStateAction } from "react";
import type {
  WeddingBooking,
  WeddingDocument,
} from "../../../../types/wedding";
import FileUploadField from "../summary/FileUploadField";

export default function SacramentsStep({
  booking,
  setBooking,
  readOnly = false,
  errors = {},
}: {
  booking: WeddingBooking;
  setBooking: Dispatch<SetStateAction<WeddingBooking>>;
  readOnly?: boolean;
  errors?: Record<string, string[]>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#B22222]">
          Baptism & Confirmation
        </h2>
        <p className="text-sm text-gray-500">Binyag at Kumpil</p>
      </div>
      {(["bride", "groom"] as const).map((role) => (
        <section
          key={role}
          className="rounded-2xl border border-gray-200 bg-white p-6"
        >
          <h3 className="mb-5 text-lg font-semibold text-[#B22222]">
            {role === "bride" ? "Bride / Nobya" : "Groom / Nobyo"}
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {(["baptism", "confirmation"] as const).map((sacrament) => {
              const statusField = `${sacrament}_status` as const;
              const parishField =
                sacrament === "baptism" ? "baptized_in" : "confirmed_in";
              const type: WeddingDocument["document_type"] = `${role}_${sacrament === "baptism" ? "baptismal" : "confirmation"}_certificate`;
              const status = booking.applicant[role].church[statusField];
              const errorKey = `applicant.${role}.church.${statusField}`;
              return (
                <fieldset key={sacrament} className="min-w-0 space-y-3">
                  <legend className="font-medium">
                    {sacrament === "baptism"
                      ? "Baptized? / Nabinyagan na?"
                      : "Confirmed? / Nakumpilan na?"}
                  </legend>
                  <div className="flex gap-5">
                    {(["yes", "no"] as const).map((answer) => (
                      <label
                        key={answer}
                        className="flex items-center gap-2 py-2 text-sm"
                      >
                        <input
                          type="radio"
                          name={`${role}-${sacrament}`}
                          checked={status === answer}
                          disabled={readOnly}
                          className="accent-[#B22222]"
                          onChange={() =>
                            setBooking((prev) => ({
                              ...prev,
                              applicant: {
                                ...prev.applicant,
                                [role]: {
                                  ...prev.applicant[role],
                                  church: {
                                    ...prev.applicant[role].church,
                                    [statusField]: answer,
                                    ...(answer === "no"
                                      ? { [parishField]: "" }
                                      : {}),
                                  },
                                },
                              },
                              documents:
                                answer === "no"
                                  ? prev.documents.filter(
                                      (d) => d.document_type !== type,
                                    )
                                  : prev.documents,
                            }))
                          }
                        />
                        {answer === "yes" ? "Yes / Oo" : "No / Hindi"}
                      </label>
                    ))}
                  </div>
                  {errors[errorKey] && (
                    <p className="text-sm text-red-600">
                      {errors[errorKey][0]}
                    </p>
                  )}
                  {status === "yes" && (
                    <>
                      <label className="block text-sm">
                        Parish name / Pangalan ng parokya
                        <input
                          value={booking.applicant[role].church[parishField]}
                          readOnly={readOnly}
                          className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                          onChange={(e) =>
                            setBooking((prev) => ({
                              ...prev,
                              applicant: {
                                ...prev.applicant,
                                [role]: {
                                  ...prev.applicant[role],
                                  church: {
                                    ...prev.applicant[role].church,
                                    [parishField]: e.target.value,
                                  },
                                },
                              },
                            }))
                          }
                        />
                      </label>
                      {errors[`applicant.${role}.church.${parishField}`] && (
                        <p className="text-sm text-red-600">
                          {errors[`applicant.${role}.church.${parishField}`][0]}
                        </p>
                      )}
                      <FileUploadField
                        label={
                          sacrament === "baptism"
                            ? "Baptismal Certificate"
                            : "Confirmation Certificate"
                        }
                        file={
                          booking.documents.find(
                            (d) => d.document_type === type,
                          )?.file ?? null
                        }
                        readOnly={readOnly}
                        onChange={(file) =>
                          setBooking((prev) => ({
                            ...prev,
                            documents: [
                              ...prev.documents.filter(
                                (d) => d.document_type !== type,
                              ),
                              ...(file ? [{ document_type: type, file }] : []),
                            ],
                          }))
                        }
                      />
                      {errors[`documents.${type}`] && (
                        <p className="text-sm text-red-600">
                          {errors[`documents.${type}`][0]}
                        </p>
                      )}
                      {!readOnly && (
                        <p className="text-xs text-gray-500">
                          PDF, JPG, PNG · Up to 5 MB. You may upload later in My
                          Profile.
                          <br />
                          Maaaring isumite sa My Profile sa ibang pagkakataon.
                        </p>
                      )}
                    </>
                  )}
                  {status === "no" && (
                    <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                      For parish coordination. Contact parish staff to arrange{" "}
                      {sacrament}; upload the certificate afterward.
                      <br />
                      Makipag-ugnayan sa parokya para sa{" "}
                      {sacrament === "baptism" ? "binyag" : "kumpil"}. Isumite
                      ang sertipiko pagkatapos.
                    </p>
                  )}
                </fieldset>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
