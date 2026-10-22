import { useEffect, useState } from "react";
import api from "@/api/axios";

export default function PermissionChecklist({
  value,
  onChange,
}: {
  value: string[];
  onChange: (permissions: string[]) => void;
}) {
  const [catalog, setCatalog] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api
      .get("/staff/settings/permissions")
      .then((response) => {
        if (active) setCatalog(response.data.data);
      })
      .catch(() => {
        if (active)
          setError(
            "Unable to load permissions. Close and reopen this form to retry.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  const toggle = (key: string, checked: boolean) => {
    let next = checked ? [...value, key] : value.filter((item) => item !== key);
    if (key === "transactions.confirm" && checked)
      next.push("transactions.view");
    if (key === "transactions.view" && !checked)
      next = next.filter((item) => item !== "transactions.confirm");
    onChange([...new Set(next)]);
  };
  return (
    <fieldset className="rounded-2xl border border-[#E7E2DA] p-4 sm:p-5">
      <legend className="px-2 font-serif text-lg font-bold text-[#292524]">
        Allowed access
      </legend>
      <p className="mb-3 text-sm text-gray-600">
        Select the areas this staff member can use. Only the Main Admin can
        create staff accounts or change their access.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { label: "Accountant (view only)", keys: ["transactions.view"] },
          {
            label: "Booking staff",
            keys: ["bookings.manage", "availability.manage", "requests.manage"],
          },
          { label: "Clear all", keys: [] },
        ].map((preset) => (
          <button
            type="button"
            key={preset.label}
            disabled={!!error || !Object.keys(catalog).length}
            className="rounded-full border border-[#E7E2DA] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#B22222] transition hover:border-[#B22222]/30 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-[#B22222] disabled:opacity-50"
            onClick={() => onChange(preset.keys)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {!error && !Object.keys(catalog).length && <p>Loading permissions…</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(catalog).map(([key, label]) => (
          <label
            key={key}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition focus-within:ring-2 focus-within:ring-[#B22222]/30 ${value.includes(key) ? "border-[#B22222]/25 bg-[#B22222]/5 text-[#292524]" : "border-[#E7E2DA] bg-white text-gray-600 hover:bg-[#FAF8F5]"}`}
          >
            <input
              type="checkbox"
              checked={value.includes(key)}
              onChange={(event) => toggle(key, event.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[#B22222]"
            />
            <span className="font-medium">
              {label}
              {key === "transactions.view" && (
                <span className="mt-1 block text-xs font-normal text-gray-500">
                  View payment records without approving payments.
                </span>
              )}
              {key === "transactions.confirm" && (
                <span className="mt-1 block text-xs font-normal text-gray-500">
                  Review and confirm payments. Includes viewing payment records.
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
