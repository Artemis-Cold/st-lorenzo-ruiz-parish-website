import type {
  DocumentDetailValue,
  PermissionRequestDetails,
} from "../../../../types/document";

interface Props {
  details: PermissionRequestDetails;
  readOnly?: boolean;
  updateRequest: (field: string, value: DocumentDetailValue) => void;
  errors?: Record<string, string[]>;
  errorPrefix: string;
}

export default function PermissionForm({
  details,
  readOnly = false,
  updateRequest,
  errors,
  errorPrefix,
}: Props) {
  const getError = (field: string) => errors?.[errorPrefix + "." + field]?.[0];
  const inputClass = `
w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700
`;

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12">
        <label className="mb-2 block text-sm font-medium">
          Full Name <span className="text-red-600">*</span>
        </label>

        <input
          className={
            inputClass + (getError("full_name") ? " border-red-400" : "")
          }
          value={details.full_name}
          readOnly
          onChange={(e) => updateRequest("full_name", e.target.value)}
          placeholder="Enter full name"
        />
        <FieldError message={getError("full_name")} />
      </div>

      <div className="col-span-12">
        <label className="mb-2 block text-sm font-medium">
          Address <span className="text-red-600">*</span>
        </label>

        <input
          className={
            inputClass + (getError("address") ? " border-red-400" : "")
          }
          value={details.address}
          readOnly
          onChange={(e) => updateRequest("address", e.target.value)}
          placeholder="Complete address"
        />
        <FieldError message={getError("address")} />
      </div>

      {!readOnly && (
        <p className="col-span-12 text-xs leading-5 text-gray-500">
          Permission requests use the registered account holder's information.
        </p>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-sm text-red-600">{message}</p>
  ) : null;
}
