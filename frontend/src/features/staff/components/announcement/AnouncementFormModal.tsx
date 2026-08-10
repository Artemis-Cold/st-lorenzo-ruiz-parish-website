import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";

export interface AnnouncementFormValues {
  title: string;
  details: string;
  postedAt: string; // ISO datetime string, e.g. "2026-06-12T09:00"
}

interface AnnouncementFormModalProps {
  open: boolean;
  initialValues?: AnnouncementFormValues;
  onClose: () => void;
  onSubmit: (values: AnnouncementFormValues) => void;
  submitting?: boolean;
}

function nowAsDatetimeLocal(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function asDatetimeLocal(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);

  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 16);
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
      ? asDatetimeLocal(initialValues.postedAt)
      : nowAsDatetimeLocal(),
  );

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
    onSubmit({ title: title.trim(), details: details.trim(), postedAt });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-7 shadow-lg sm:p-8">
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
              Date &amp; Time
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
