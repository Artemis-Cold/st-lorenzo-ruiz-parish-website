import type { PermissionRequestDetails } from "../../../../types/document";

interface Props {
  details: PermissionRequestDetails;
  readOnly?: boolean;
  updateRequest: (field: string, value: any) => void;
}

export default function PermissionForm({
  details,
  readOnly = false,
  updateRequest,
}: Props) {
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
          Full Name
        </label>

        <input
          className={inputClass}
          value={details.fullName}
          readOnly={readOnly}
          onChange={(e) =>
            updateRequest("fullName", e.target.value)
          }
          placeholder="Enter full name"
        />
      </div>

      <div className="col-span-12">
        <label className="mb-2 block text-sm font-medium">
          Address
        </label>

        <input
          className={inputClass}
          value={details.address}
          readOnly={readOnly}
          onChange={(e) =>
            updateRequest("address", e.target.value)
          }
          placeholder="Complete address"
        />
      </div>
    </div>
  );
}