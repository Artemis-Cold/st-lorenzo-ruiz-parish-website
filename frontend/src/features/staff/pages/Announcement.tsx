import { useState } from "react";
import { toast } from "sonner";
import { Bell, Plus, Pencil, Trash2 } from "lucide-react";

import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import AnnouncementFormModal, {
  type AnnouncementFormValues,
} from "../components/announcement/AnouncementFormModal";
import ConfirmDialog from "../components/announcement/ConfirmDialog";

interface Announcement extends AnnouncementFormValues {
  id: number;
}

function formatPostedAt(isoLocal: string): string {
  const date = new Date(isoLocal);

  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Mock data — replace with a real fetch/mutations once the backend exists
const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Parish Office Closed",
    details: "The parish office will be closed on June 20 for a staff retreat.",
    postedAt: "2026-06-12T09:00",
  },
  {
    id: 2,
    title: "Wedding Seminar Schedule",
    details:
      "The next pre-marriage seminar is on June 12 at 1:00 PM, Parish Hall.",
    postedAt: "2026-06-05T14:30",
  },
];

export default function Announcements() {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState<Announcement | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setFormOpen(true);
  };

  const handleSubmit = (values: AnnouncementFormValues) => {
    const isScheduled = new Date(values.postedAt).getTime() > Date.now();

    if (editing) {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === editing.id ? { ...a, ...values } : a)),
      );

      toast.success(`"${values.title}" has been updated.`);
    } else {
      setAnnouncements((prev) => [{ id: Date.now(), ...values }, ...prev]);

      toast.success(
        isScheduled
          ? `"${values.title}" has been scheduled for ${formatPostedAt(values.postedAt)}.`
          : `"${values.title}" has been published.`,
      );
    }

    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;

    setAnnouncements((prev) => prev.filter((a) => a.id !== deleting.id));
    toast.success(`"${deleting.title}" has been deleted.`);
    setDeleting(null);
  };

  // newest first, by the date/time staff actually set
  const sortedAnnouncements = [...announcements].sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  );

  return (
    <StaffDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Page header */}
        <div className="relative overflow-hidden rounded-3xl bg-[#B22222] px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/[0.06]"
          />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Bell size={22} />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold sm:text-3xl">
                  Community Announcements
                </h1>
                <p className="mt-1 text-sm text-white/75">
                  Keep parishioners informed of parish news and updates.
                </p>
              </div>
            </div>

            <button
              onClick={openCreate}
              className="flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 py-3 font-semibold text-[#B22222] transition hover:bg-white/90 sm:self-auto"
            >
              <Plus size={18} />
              Add Announcement
            </button>
          </div>
        </div>

        {/* List */}
        <div className="rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-sm sm:p-7">
          <h2 className="mb-6 font-serif text-lg font-bold text-[#292524] sm:text-xl">
            Recent Announcements
          </h2>

          {sortedAnnouncements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E7E2DA] py-16 text-center">
              <Bell className="mx-auto mb-3 text-gray-300" size={28} />
              <p className="text-sm text-gray-400">
                No announcements yet. Add one to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAnnouncements.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[#E7E2DA] p-4 transition hover:border-[#B22222]/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B22222] text-white">
                      <Bell size={16} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-[#292524]">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {item.details}
                      </p>
                      <p className="mt-1.5 text-xs tabular-nums text-gray-400">
                        {formatPostedAt(item.postedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => openEdit(item)}
                      aria-label="Edit"
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#B22222]"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleting(item)}
                      aria-label="Delete"
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnnouncementFormModal
        open={formOpen}
        initialValues={editing ?? undefined}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete announcement?"
        description={`"${deleting?.title}" will be permanently removed and no longer visible to parishioners.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </StaffDashboardLayout>
  );
}
