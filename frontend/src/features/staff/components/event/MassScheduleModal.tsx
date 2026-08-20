import { CalendarPlus, Church, Clock3, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { MassScheduleInput } from "@/services/eventService";

interface Props {
  submitting: boolean;
  errors: Record<string, string[]>;
  onClose: () => void;
  onClearError: (field: keyof MassScheduleInput) => void;
  onSubmit: (values: MassScheduleInput) => void;
}

const currentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export default function MassScheduleModal({
  submitting,
  errors,
  onClose,
  onClearError,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<MassScheduleInput>({
    month: currentMonth(),
    location: "Parish Church",
  });

  const update = (field: keyof MassScheduleInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    onClearError(field);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ ...form, location: form.location.trim() });
  };

  const fieldClass = (field: keyof MassScheduleInput) =>
    `mt-2 w-full rounded-xl border px-4 py-3 outline-none transition ${
      errors[field]
        ? "border-red-400 bg-red-50/30 focus:border-red-500"
        : "border-[#E7E2DA] focus:border-[#B22222]"
    }`;

  return (
    <div data-app-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="mass-schedule-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700"><Church size={21} /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#B22222]">Recurring schedule</p>
              <h2 id="mass-schedule-title" className="mt-1 font-serif text-2xl font-bold text-[#292524]">Add Monthly Masses</h2>
              <p className="mt-1 text-sm leading-5 text-gray-500">Generate the regular Mass schedule for an entire month.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={19} /></button>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-950">
          <p className="flex items-center gap-2 font-semibold"><Clock3 size={16} />Fixed Mass times</p>
          <dl className="mt-3 space-y-2 text-xs leading-5">
            <div className="flex justify-between gap-4"><dt className="text-amber-800">Monday–Saturday</dt><dd className="font-semibold">6:00 AM</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-amber-800">Sunday</dt><dd className="text-right font-semibold">6:00 AM, 9:00 AM, 4:30 PM</dd></div>
          </dl>
        </div>

        <form onSubmit={submit} noValidate className="mt-6 space-y-5">
          <label className="block text-sm font-medium text-gray-700">
            Schedule month
            <input type="month" required min={currentMonth()} value={form.month} onChange={(event) => update("month", event.target.value)} aria-invalid={Boolean(errors.month)} className={fieldClass("month")} />
            {errors.month?.[0] && <p className="mt-1.5 text-xs text-red-600">{errors.month[0]}</p>}
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Mass location <span className="font-normal text-gray-400">(optional)</span>
            <input maxLength={255} value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="e.g. Main Parish Church" aria-invalid={Boolean(errors.location)} className={fieldClass("location")} />
            {errors.location?.[0] && <p className="mt-1.5 text-xs text-red-600">{errors.location[0]}</p>}
          </label>

          <p className="rounded-xl bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">Existing Mass entries for the selected month will be skipped automatically, so this action is safe to run again.</p>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white hover:bg-[#991B1B] disabled:opacity-50"><CalendarPlus size={17} />{submitting ? "Adding Masses..." : "Add Mass Schedule"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
