import type {
  DocumentDetailValue,
  DocumentRequesterProfile,
  MarriageCertificateDetails,
} from "../../../../types/document";

interface Props {
  details: MarriageCertificateDetails;
  requester: DocumentRequesterProfile;
  readOnly?: boolean;
  updateRequest: (field: string, value: DocumentDetailValue) => void;
  errors?: Record<string, string[]>;
  errorPrefix: string;
}

export default function MarriageForm({
  details,
  requester,
  readOnly = false,
  updateRequest,
  errors,
  errorPrefix,
}: Props) {
  const getError = (field: string) => errors?.[errorPrefix + "." + field]?.[0];
  const today = toDateInputValue(new Date());
  const inputClass = `
w-full rounded-xl border px-4 py-3 transition
${
  readOnly
    ? "border-gray-200 bg-gray-50 text-gray-700"
    : "border-gray-300 bg-white focus:border-[#B22222] focus:outline-none"
}
`;
  const selectRequesterRole = (role: "" | "Bride" | "Groom") => {
    updateRequest("requester_role", role);
    updateRequest("address", requester.address);

    if (!role) {
      if (
        details.requester_role === "Bride" &&
        details.bride_name === requester.fullName
      ) {
        updateRequest("bride_name", "");
      }
      if (
        details.requester_role === "Groom" &&
        details.groom_name === requester.fullName
      ) {
        updateRequest("groom_name", "");
      }
      return;
    }

    if (role === "Bride") {
      updateRequest("bride_name", requester.fullName);
      if (
        details.requester_role === "Groom" &&
        details.groom_name === requester.fullName
      ) {
        updateRequest("groom_name", "");
      }
      return;
    }

    updateRequest("groom_name", requester.fullName);
    if (
      details.requester_role === "Bride" &&
      details.bride_name === requester.fullName
    ) {
      updateRequest("bride_name", "");
    }
  };

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12">
        <label className="mb-2 block text-sm font-medium">
          Account Holder Is the <span className="text-red-600">*</span>
        </label>
        <select
          className={
            inputClass + (getError("requester_role") ? " border-red-400" : "")
          }
          value={details.requester_role}
          disabled={readOnly}
          onChange={(event) =>
            selectRequesterRole(event.target.value as "" | "Bride" | "Groom")
          }
        >
          <option value="">Select bride or groom</option>
          <option value="Bride">Bride</option>
          <option value="Groom">Groom</option>
        </select>
        <FieldError message={getError("requester_role")} />
        <p className="mt-2 text-xs leading-5 text-gray-500">
          The selected name will use the account holder's profile and cannot be
          replaced with another person.
        </p>
      </div>

      <div className="col-span-12 md:col-span-6">
        <label className="mb-2 block text-sm font-medium">
          Bride's Full Name <span className="text-red-600">*</span>
        </label>

        <input
          className={
            inputClass + (getError("bride_name") ? " border-red-400" : "")
          }
          value={details.bride_name}
          readOnly={readOnly || details.requester_role === "Bride"}
          onChange={(e) => updateRequest("bride_name", e.target.value)}
          placeholder="Enter bride's name"
        />
        <FieldError message={getError("bride_name")} />
      </div>

      <div className="col-span-12 md:col-span-6">
        <label className="mb-2 block text-sm font-medium">
          Groom's Full Name <span className="text-red-600">*</span>
        </label>

        <input
          className={
            inputClass + (getError("groom_name") ? " border-red-400" : "")
          }
          value={details.groom_name}
          readOnly={readOnly || details.requester_role === "Groom"}
          onChange={(e) => updateRequest("groom_name", e.target.value)}
          placeholder="Enter groom's name"
        />
        <FieldError message={getError("groom_name")} />
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

      <div className="col-span-12 md:col-span-6">
        <label className="mb-2 block text-sm font-medium">
          Date of Marriage <span className="text-red-600">*</span>
        </label>

        <input
          type="date"
          max={today}
          className={
            inputClass + (getError("marriage_date") ? " border-red-400" : "")
          }
          readOnly={readOnly}
          value={
            details.marriage_date
              ? details.marriage_date.toISOString().split("T")[0]
              : ""
          }
          onChange={(e) =>
            updateRequest(
              "marriage_date",
              e.target.value ? new Date(e.target.value) : null,
            )
          }
        />
        <FieldError message={getError("marriage_date")} />
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-sm text-red-600">{message}</p>
  ) : null;
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}
