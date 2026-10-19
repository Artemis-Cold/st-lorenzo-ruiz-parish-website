import FieldError from "@/features/parishioner/components/booking/FieldError";
import BookingLabel from "@/features/parishioner/components/booking/BookingLabel";
import type {
  DeathCertificateDetails,
  DocumentDetailValue,
} from "../../../../types/document";
import { deathRecordRelationships } from "../documentRequestOptions";

interface Props {
  details: DeathCertificateDetails;
  readOnly?: boolean;
  updateRequest: (field: string, value: DocumentDetailValue) => void;
  errors?: Record<string, string[]>;
  errorPrefix: string;
}

export default function DeathForm({
  details,
  readOnly = false,
  updateRequest,
  errors,
  errorPrefix,
}: Props) {
  const getError = (field: string) => errors?.[errorPrefix + "." + field]?.[0];
  const inputClass = `
w-full rounded-xl border px-4 py-3 transition
${
  readOnly
    ? "border-gray-200 bg-gray-50 text-gray-700"
    : "border-gray-300 bg-white focus:border-[#B22222] focus:outline-none"
}
`;

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12">
        <BookingLabel className="mb-2 block text-sm font-medium">
          Full Name <span className="text-red-600">*</span>
        </BookingLabel>

        <input
          className={inputClass + (getError("name") ? " border-red-400" : "")}
          value={details.name}
          readOnly={readOnly}
          onChange={(e) => updateRequest("name", e.target.value)}
          placeholder="Enter deceased's full name"
        />
        <FieldError message={getError("name")} />
      </div>

      <div className="col-span-12">
        <BookingLabel className="mb-2 block text-sm font-medium">
          Relationship to Deceased <span className="text-red-600">*</span>
        </BookingLabel>

        <select
          className={
            inputClass +
            (getError("relationship_to_owner") ? " border-red-400" : "")
          }
          value={details.relationship_to_owner}
          disabled={readOnly}
          onChange={(event) =>
            updateRequest("relationship_to_owner", event.target.value)
          }
        >
          {deathRecordRelationships.map((relationship) => (
            <option key={relationship.value} value={relationship.value}>
              {relationship.label}
            </option>
          ))}
        </select>
        <FieldError message={getError("relationship_to_owner")} />
      </div>

      <div className="col-span-12">
        <BookingLabel className="mb-2 block text-sm font-medium">
          Address <span className="text-red-600">*</span>
        </BookingLabel>

        <input
          className={
            inputClass + (getError("address") ? " border-red-400" : "")
          }
          value={details.address}
          readOnly={readOnly}
          onChange={(e) => updateRequest("address", e.target.value)}
          placeholder="Complete address"
        />
        <FieldError message={getError("address")} />
      </div>
    </div>
  );
}
