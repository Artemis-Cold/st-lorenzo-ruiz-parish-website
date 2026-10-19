import type {
  DocumentDetailValue,
  DocumentDetails,
  DocumentType,
} from "../../../../types/document";
import { documentOwnerRelationships } from "../documentRequestOptions";
import { useId } from "react";
import BookingLabel from "../../BookingLabel";

export default function NewDocumentForm({
  type,
  details,
  updateRequest,
  readOnly,
  errors,
  errorPrefix,
}: {
  type: DocumentType;
  details: DocumentDetails;
  updateRequest: (field: string, value: DocumentDetailValue) => void;
  readOnly?: boolean;
  errors?: Record<string, string[]>;
  errorPrefix: string;
}) {
  const formId = useId();
  const certificate = type === "First Communion Certificate";
  const fields = certificate
    ? [
        [
          "name",
          "Record owner's name / Pangalan ng tumanggap ng Unang Komunyon",
          "text",
        ],
        ["address", "Address / Tirahan", "text"],
        [
          "relationship_to_owner",
          "Relationship to record owner / Kaugnayan sa may-ari ng rekord",
          "select",
        ],
        [
          "communion_date",
          "Date of First Communion / Petsa ng Unang Komunyon",
          "date",
        ],
      ]
    : [
        ["requester_name", "Requester name / Pangalan ng nagrerequest", "text"],
        ["requester_address", "Requester address / Taga saan", "text"],
        [
          "person_name",
          type.includes("Marriage")
            ? "Couple's names / Pangalan ng ikakasal"
            : type === "Death Permit"
              ? "Deceased's name / Pangalan ng yumao"
              : type === "Baptism Permission"
                ? "Candidate's name / Pangalan ng bibinyagan"
                : "Candidate's name / Pangalan ng kukumpilan",
          "text",
        ],
        [
          "parish_name",
          "Parish where the service will be held / Parokyang pagdarausan",
          "text",
        ],
        ["event_date", "Date / Petsa", "date"],
        ["event_time", "Time / Oras", "time"],
      ];
  const values = details as Record<string, DocumentDetailValue>;
  const inputClass = (field: string) =>
    `w-full rounded-xl border px-4 py-3 transition ${
      readOnly
        ? "border-gray-200 bg-gray-50 text-gray-700"
        : errors?.[`${errorPrefix}.${field}`]?.[0]
          ? "border-red-400 bg-white focus:border-red-500 focus:outline-none"
          : "border-gray-300 bg-white focus:border-[#B22222] focus:outline-none"
    }`;
  return (
    <div className="grid grid-cols-12 gap-5">
      {fields.map(([field, label, inputType]) => {
        const value = values[field];
        const display =
          value instanceof Date
            ? value.toISOString().slice(0, 10)
            : (value ?? "");
        return (
          <div
            key={field}
            className={
              inputType === "date" || inputType === "time"
                ? "col-span-12 md:col-span-6"
                : "col-span-12"
            }
          >
            <BookingLabel
              htmlFor={`${formId}-${field}`}
              className="mb-2 block text-sm font-medium"
            >
              {field === "name"
                ? "Full Name"
                : field === "relationship_to_owner"
                  ? "Relationship to Record Owner"
                  : label.split(" / ")[0]}{" "}
              <span className="text-red-600">*</span>
            </BookingLabel>
            {inputType === "select" ? (
              <select
                id={`${formId}-${field}`}
                value={String(display)}
                disabled={readOnly}
                onChange={(e) => updateRequest(field, e.target.value)}
                className={inputClass(field)}
              >
                {documentOwnerRelationships.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`${formId}-${field}`}
                type={inputType}
                placeholder={
                  inputType !== "text"
                    ? undefined
                    : field.includes("address")
                      ? "Complete address"
                      : field === "parish_name"
                        ? "Enter parish name and location"
                        : field === "person_name" && type.includes("Marriage")
                          ? "Enter bride and groom's full names"
                          : "Enter full name"
                }
                value={String(display)}
                readOnly={readOnly}
                onChange={(e) =>
                  updateRequest(
                    field,
                    certificate && inputType === "date"
                      ? e.target.value
                        ? new Date(e.target.value)
                        : null
                      : e.target.value,
                  )
                }
                className={inputClass(field)}
              />
            )}
            <FieldError message={errors?.[`${errorPrefix}.${field}`]?.[0]} />
          </div>
        );
      })}
    </div>
  );
}
import FieldError from "../../FieldError";
