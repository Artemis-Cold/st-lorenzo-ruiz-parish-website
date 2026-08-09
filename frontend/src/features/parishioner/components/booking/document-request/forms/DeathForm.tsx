import type {
  DeathCertificateDetails,
  DocumentDetailValue,
} from "../../../../types/document";

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
        <label className="mb-2 block text-sm font-medium">
          Full Name <span className="text-red-600">*</span>
        </label>

        <input
          className={inputClass + (getError("name") ? " border-red-400" : "")}
          value={details.name}
          readOnly={readOnly}
          onChange={(e) =>
            updateRequest("name", e.target.value)
          }
          placeholder="Enter deceased's full name"
        />
        <FieldError message={getError("name")} />
      </div>

      <div className="col-span-12">
        <label className="mb-2 block text-sm font-medium">
          Address <span className="text-red-600">*</span>
        </label>

        <input
          className={inputClass + (getError("address") ? " border-red-400" : "")}
          value={details.address}
          readOnly={readOnly}
          onChange={(e) =>
            updateRequest("address", e.target.value)
          }
          placeholder="Complete address"
        />
        <FieldError message={getError("address")} />
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null;
}
