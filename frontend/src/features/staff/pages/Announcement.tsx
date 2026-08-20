import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Archive, Bell, CalendarClock, ChevronLeft, ChevronRight, ListFilter, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  createAnnouncement,
  deleteAnnouncement,
  getStaffAnnouncements,
  updateAnnouncement,
  type Announcement,
  type StaffAnnouncementGroup,
} from "@/services/announcementService";
import AnnouncementFormModal, {
  type AnnouncementFormValues,
} from "../components/announcement/AnouncementFormModal";
import ConfirmDialog from "../components/announcement/ConfirmDialog";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";

function formatPostedAt(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}

const announcementGroups: Array<{
  value: StaffAnnouncementGroup;
  label: string;
  icon: typeof Bell;
}> = [
  { value: "all", label: "All Announcements", icon: ListFilter },
  { value: "scheduled", label: "Scheduled", icon: CalendarClock },
  { value: "past", label: "Past Announcements", icon: Archive },
];

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [group, setGroup] = useState<StaffAnnouncementGroup>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: null as number | null, to: null as number | null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState<Announcement | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let active = true;

    const loadAnnouncements = async () => {
      setLoading(true);
      try {
        const result = await getStaffAnnouncements({
          group,
          search: debouncedSearch || undefined,
          page,
          perPage: 10,
        });
        if (active) {
          setAnnouncements(result.data);
          setMeta(result.meta);
        }
      } catch (error) {
        if (active) {
          toast.error(apiErrorMessage(error, "Unable to load announcements."));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadAnnouncements();
    return () => {
      active = false;
    };
  }, [debouncedSearch, group, page, refreshKey]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setFormOpen(true);
  };

  const handleSubmit = async (values: AnnouncementFormValues) => {
    const isScheduled = new Date(values.postedAt).getTime() > Date.now();
    setSaving(true);

    try {
      if (editing) {
        const updated = await updateAnnouncement(editing.id, values);
        toast.success(`"${updated.title}" has been updated.`);
      } else {
        const created = await createAnnouncement(values);
        toast.success(
          isScheduled
            ? `"${created.title}" has been scheduled for ${formatPostedAt(created.postedAt)}.`
            : `"${created.title}" has been published.`,
        );
      }

      setGroup("all");
      setSearch("");
      setPage(1);
      setRefreshKey((key) => key + 1);

      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Unable to save the announcement."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingId(deleting.id);

    try {
      await deleteAnnouncement(deleting.id);
      toast.success(`"${deleting.title}" has been deleted.`);
      setDeleting(null);
      if (announcements.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        setRefreshKey((key) => key + 1);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, "Unable to delete the announcement."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <StaffDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#B22222] px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/[0.06]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10"><Bell size={22} /></div>
              <div>
                <h1 className="font-serif text-2xl font-bold sm:text-3xl">Community Announcements</h1>
                <p className="mt-1 text-sm text-white/75">Keep parishioners informed of parish news and updates.</p>
              </div>
            </div>
            <button onClick={openCreate} className="flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 py-3 font-semibold text-[#B22222] transition hover:bg-white/90 sm:self-auto">
              <Plus size={18} /> Add Announcement
            </button>
          </div>
        </div>

        <section className="flex h-[38rem] flex-col overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-sm lg:h-[clamp(38rem,72vh,48rem)]">
          <div className="shrink-0 border-b border-gray-100 px-5 pt-5 sm:px-7 sm:pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-serif text-lg font-bold text-[#292524] sm:text-xl">Announcement Library</h2>
                  {!loading && <span className="rounded-full bg-[#F5F1EB] px-2.5 py-1 text-xs font-semibold text-[#71685F]">{meta.total}</span>}
                </div>
                <p className="mt-1 text-sm text-gray-500">Find current, scheduled, and previously published notices.</p>
              </div>

              <label className="relative block w-full lg:w-80">
                <span className="sr-only">Search announcements</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title or details"
                  className="h-11 w-full rounded-xl border border-[#DDD7CF] bg-[#FAF9F7] pl-10 pr-10 text-sm text-[#292524] outline-none transition placeholder:text-gray-400 focus:border-[#B22222]/60 focus:bg-white focus:ring-4 focus:ring-[#B22222]/5"
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                    <X size={15} />
                  </button>
                )}
              </label>
            </div>

            <div className="mt-5 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Announcement groups">
              {announcementGroups.map((item) => {
                const Icon = item.icon;
                const active = group === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setGroup(item.value);
                      setPage(1);
                    }}
                    className={`relative flex shrink-0 items-center gap-2 px-3.5 pb-3 text-sm font-semibold transition sm:px-4 ${active ? "text-[#B22222]" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    <Icon size={16} />
                    {item.label}
                    {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#B22222]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pr-3 sm:p-6 sm:pr-4 [scrollbar-color:#D6CEC4_transparent] [scrollbar-width:thin]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-center"><p className="text-sm text-gray-400">Loading announcements...</p></div>
            ) : announcements.length === 0 ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E7E2DA] px-6 text-center">
                {group === "past" ? <Archive className="mb-3 text-gray-300" size={28} /> : group === "scheduled" ? <CalendarClock className="mb-3 text-gray-300" size={28} /> : <Bell className="mb-3 text-gray-300" size={28} />}
                <p className="text-sm font-medium text-gray-500">
                  {debouncedSearch
                    ? `No announcements found for “${debouncedSearch}”.`
                    : group === "past"
                      ? "No previously published announcements."
                      : group === "scheduled"
                        ? "No scheduled announcements."
                        : "No announcements yet. Add one to get started."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((item) => (
                <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-[#E7E2DA] p-4 transition hover:border-[#B22222]/30 hover:shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B22222] text-white"><Bell size={16} /></div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words font-semibold text-[#292524]">{item.title}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${item.status === "scheduled" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{item.status === "scheduled" ? "Scheduled" : "Published"}</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 break-words text-sm leading-6 text-gray-600">{item.details}</p>
                      <p className="mt-1.5 text-xs tabular-nums text-gray-400">{formatPostedAt(item.postedAt)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                    <button onClick={() => openEdit(item)} aria-label="Edit" className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#B22222]"><Pencil size={16} /></button>
                    <button onClick={() => setDeleting(item)} aria-label="Delete" className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </article>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-t border-gray-100 px-5 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p>{meta.total > 0 ? `Showing ${meta.from}–${meta.to} of ${meta.total}` : "No records"}</p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={loading || meta.current_page <= 1} aria-label="Previous page" className="grid size-9 place-items-center rounded-lg border border-[#DDD7CF] text-gray-600 transition hover:border-[#B22222]/40 hover:text-[#B22222] disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronLeft size={17} />
              </button>
              <span className="min-w-24 text-center text-xs font-medium text-gray-600">Page {meta.current_page} of {meta.last_page}</span>
              <button type="button" onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))} disabled={loading || meta.current_page >= meta.last_page} aria-label="Next page" className="grid size-9 place-items-center rounded-lg border border-[#DDD7CF] text-gray-600 transition hover:border-[#B22222]/40 hover:text-[#B22222] disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </div>

      <AnnouncementFormModal
        key={`${editing?.id ?? "new"}-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        initialValues={editing ?? undefined}
        submitting={saving}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Delete announcement?"
        description={`"${deleting?.title}" will be permanently removed and no longer visible to parishioners.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        confirming={deletingId !== null}
      />
    </StaffDashboardLayout>
  );
}
