import type { MarriageCertificateDetails } from "../../../../types/document";

interface Props {
  details: MarriageCertificateDetails;
  readOnly?: boolean;
  updateRequest: (field: string, value: any) => void;
}

export default function MarriageForm({
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
      <div className="col-span-12 md:col-span-6">
        <label className="mb-2 block text-sm font-medium">
          Bride's Full Name
        </label>

        <input
          className={inputClass}
          value={details.brideName}
          readOnly={readOnly}
          onChange={(e) =>
            updateRequest("brideName", e.target.value)
          }
          placeholder="Enter bride's name"
        />
      </div>

      <div className="col-span-12 md:col-span-6">
        <label className="mb-2 block text-sm font-medium">
          Groom's Full Name
        </label>

        <input
          className={inputClass}
          value={details.groomName}
          readOnly={readOnly}
          onChange={(e) =>
            updateRequest("groomName", e.target.value)
          }
          placeholder="Enter groom's name"
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
          Date of Marriage
        </label>

        <input
          type="date"
          className={inputClass}
          readOnly={readOnly}
          value={
            details.marriageDate
              ? details.marriageDate.toISOString().split("T")[0]
              : ""
          }
          onChange={(e) =>
            updateRequest(
              "marriageDate",
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