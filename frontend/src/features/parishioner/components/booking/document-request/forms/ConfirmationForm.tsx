import type { ConfirmationCertificateDetails } from "../../../../types/document";

interface Props {
  details: ConfirmationCertificateDetails;
  readOnly?: boolean;
  updateRequest: (field: string, value: any) => void;
}

export default function ConfirmationForm({
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
          value={details.name}
          readOnly={readOnly}
          onChange={(e) =>
            updateRequest("name", e.target.value)
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

      <div className="col-span-12 md:col-span-6">
        <label className="mb-2 block text-sm font-medium">
          Date of Confirmation
        </label>

        <input
          type="date"
          className={inputClass}
          readOnly={readOnly}
          value={
            details.confirmationDate
              ? details.confirmationDate.toISOString().split("T")[0]
              : ""
          }
          onChange={(e) =>
            updateRequest(
              "confirmationDate",
              e.target.value
                ? new Date(e.target.value)
                : null,
            )
          }
        />
      </div>
    </div>
  );
}