import { useState, type FormEvent } from "react";
import { X } from "lucide-react";

import type { ParishEventInput } from "@/services/eventService";

interface Props {
  initialValues?: ParishEventInput;
  onClose: () => void;
  onSubmit: (values: ParishEventInput) => void;
  submitting: boolean;
  errors: Record<string, string[]>;
  onClearError: (field: keyof ParishEventInput) => void;
}

const toLocalInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
};

export default function EventFormModal({
  initialValues,
  onClose,
  onSubmit,
  submitting,
  errors,
  onClearError,
}: Props) {
  const [form, setForm] = useState<ParishEventInput>({
    title: initialValues?.title ?? "",
    details: initialValues?.details ?? "",
    location: initialValues?.location ?? "",
    startsAt: toLocalInput(initialValues?.startsAt),
    endsAt: toLocalInput(initialValues?.endsAt),
  });

  const update = (field: keyof ParishEventInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    onClearError(field);
  };

  const inputClass = (field: keyof ParishEventInput) =>
    `mt-2 w-full rounded-xl border px-4 py-3 outline-none transition ${
      errors[field]
        ? "border-red-400 bg-red-50/30 focus:border-red-500"
        : "border-[#E7E2DA] focus:border-[#B22222]"
    }`;

  const errorText = (field: keyof ParishEventInput) =>
    errors[field]?.[0] ? (
      <p className="mt-1.5 text-xs text-red-600">{errors[field][0]}</p>
    ) : null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      ...form,
      title: form.title.trim(),
      details: form.details.trim(),
      location: form.location.trim(),
    });
  };

  return (
    <div data-app-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section data-modal-scroll="true" role="dialog" aria-modal="true" aria-labelledby="event-form-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B22222]">Parish calendar</p>
            <h2 id="event-form-title" className="mt-1 font-serif text-2xl font-bold text-[#292524]">{initialValues ? "Edit Event" : "Add Event"}</h2>
            <p className="mt-1 text-sm text-gray-500">Event dates and times will appear on public parish calendars.</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={20} /></button>
        </div>

        <form onSubmit={submit} noValidate className="space-y-5">
          <label className="block text-sm font-medium text-gray-700">Event title
            <input required maxLength={255} value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Parish Feast Day" aria-invalid={Boolean(errors.title)} className={inputClass("title")} />
            {errorText("title")}
          </label>
          <label className="block text-sm font-medium text-gray-700">Details
            <textarea required rows={4} value={form.details} onChange={(event) => update("details", event.target.value)} placeholder="Describe the event and anything parishioners should prepare." aria-invalid={Boolean(errors.details)} className={`${inputClass("details")} resize-none`} />
            {errorText("details")}
          </label>
          <label className="block text-sm font-medium text-gray-700">Location <span className="font-normal text-gray-400">(optional)</span>
            <input maxLength={255} value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="e.g. Parish Church" aria-invalid={Boolean(errors.location)} className={inputClass("location")} />
            {errorText("location")}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">Starts at
              <input required type="datetime-local" value={form.startsAt} onChange={(event) => update("startsAt", event.target.value)} aria-invalid={Boolean(errors.startsAt)} className={inputClass("startsAt")} />
              {errorText("startsAt")}
            </label>
            <label className="block text-sm font-medium text-gray-700">Ends at <span className="font-normal text-gray-400">(optional)</span>
              <input type="datetime-local" min={form.startsAt || undefined} value={form.endsAt} onChange={(event) => update("endsAt", event.target.value)} aria-invalid={Boolean(errors.endsAt)} className={inputClass("endsAt")} />
              {errorText("endsAt")}
            </label>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white hover:bg-[#991B1B] disabled:opacity-50">{submitting ? "Saving..." : initialValues ? "Save Changes" : "Add Event"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
