import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";

export interface AnnouncementFormValues {
  title: string;
  details: string;
  postedAt: string; // ISO datetime string with the Philippine UTC+08:00 offset
  expiresAt?: string | null;
}

interface AnnouncementFormModalProps {
  open: boolean;
  initialValues?: AnnouncementFormValues;
  onClose: () => void;
  onSubmit: (values: AnnouncementFormValues) => void;
  submitting?: boolean;
}

const manilaDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function asManilaDatetimeLocal(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);

  const parts = Object.fromEntries(
    manilaDateTimeFormatter
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value: part }) => [type, part]),
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function toManilaIso(value: string): string {
  return `${value.length === 16 ? `${value}:00` : value}+08:00`;
}

export default function AnnouncementFormModal({
  open,
  initialValues,
  onClose,
  onSubmit,
  submitting = false,
}: AnnouncementFormModalProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [details, setDetails] = useState(initialValues?.details ?? "");
  const [postedAt, setPostedAt] = useState(
    initialValues?.postedAt
      ? asManilaDatetimeLocal(initialValues.postedAt)
      : asManilaDatetimeLocal(new Date().toISOString()),
  );
  const [expiresAt, setExpiresAt] = useState(
    initialValues?.expiresAt
      ? asManilaDatetimeLocal(initialValues.expiresAt)
      : "",
  );
  const [expiresAtError, setExpiresAtError] = useState("");

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      expiresAt &&
      new Date(toManilaIso(expiresAt)).getTime() <=
        new Date(toManilaIso(postedAt)).getTime()
    ) {
      setExpiresAtError("Post until must be later than the publish time.");
      return;
    }

    onSubmit({
      title: title.trim(),
      details: details.trim(),
      postedAt: toManilaIso(postedAt),
      expiresAt: expiresAt ? toManilaIso(expiresAt) : null,
    });
  };

  return (
    <div
      data-app-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        data-modal-scroll="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-7 shadow-lg sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#292524]">
              {initialValues ? "Edit Announcement" : "New Announcement"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {initialValues
                ? "Update the details below."
                : "This will be visible to all parishioners once published."}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Parish Office Closed on June 20"
              className="w-full rounded-xl border border-[#E7E2DA] px-4 py-3 outline-none transition focus:border-[#B22222]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Details
            </label>
            <textarea
              required
              disabled={submitting}
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add the full details parishioners should know..."
              className="w-full resize-none rounded-xl border border-[#E7E2DA] px-4 py-3 outline-none transition focus:border-[#B22222]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Publish Date &amp; Time
            </label>
            <input
              type="datetime-local"
              required
              disabled={submitting}
              value={postedAt}
              onChange={(e) => setPostedAt(e.target.value)}
              className="w-full rounded-xl border border-[#E7E2DA] px-4 py-3 outline-none transition focus:border-[#B22222]"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Set a future time to schedule this announcement, or leave it as
              now to publish immediately.
            </p>
          </div>

          <div>
            <label
              htmlFor="announcement-expires-at"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Post Until{" "}
              <span className="font-normal text-gray-400">(Optional)</span>
            </label>
            <input
              id="announcement-expires-at"
              type="datetime-local"
              disabled={submitting}
              min={postedAt}
              value={expiresAt}
              onChange={(event) => {
                setExpiresAt(event.target.value);
                setExpiresAtError("");
              }}
              aria-invalid={expiresAtError ? "true" : undefined}
              aria-describedby={
                expiresAtError ? "announcement-expires-at-error" : undefined
              }
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[#B22222] ${expiresAtError ? "border-red-400" : "border-[#E7E2DA]"}`}
            />
            {expiresAtError ? (
              <p
                id="announcement-expires-at-error"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {expiresAtError}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-500">
                The announcement will automatically leave public pages after
                this time. Leave blank to keep it published indefinitely.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-[#E7E2DA] py-3 font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-[#B22222] py-3 font-semibold text-white transition hover:bg-[#8B1C1C]"
            >
              {submitting
                ? "Saving..."
                : initialValues
                  ? "Save Changes"
                  : "Publish Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
