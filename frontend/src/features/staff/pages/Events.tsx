import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Archive, CalendarDays, ChevronLeft, ChevronRight, Church, Clock3, MapPin, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  createEvent,
  createMassSchedule,
  deleteEvent,
  getStaffEvents,
  updateEvent,
  type ParishEvent,
  type ParishEventInput,
  type MassScheduleInput,
  type StaffEventGroup,
} from "@/services/eventService";
import ConfirmDialog from "../components/announcement/ConfirmDialog";
import EventFormModal from "../components/event/EventFormModal";
import MassScheduleModal from "../components/event/MassScheduleModal";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const apiMessage = (error: unknown, fallback: string) =>
  error instanceof AxiosError ? error.response?.data?.message ?? fallback : fallback;

const eventGroups: Array<{
  value: StaffEventGroup;
  label: string;
  icon: typeof CalendarDays;
}> = [
  { value: "events", label: "Upcoming Events", icon: CalendarDays },
  { value: "masses", label: "Mass Schedule", icon: Church },
  { value: "past", label: "Past", icon: Archive },
];

const formValues = (event?: ParishEvent | null): ParishEventInput | undefined =>
  event
    ? {
        title: event.title,
        details: event.details,
        location: event.location ?? "",
        startsAt: event.startsAt,
        endsAt: event.endsAt ?? "",
      }
    : undefined;

export default function Events() {
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [group, setGroup] = useState<StaffEventGroup>("events");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: null as number | null, to: null as number | null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ParishEvent | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [massScheduleOpen, setMassScheduleOpen] = useState(false);
  const [deleting, setDeleting] = useState<ParishEvent | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [massFieldErrors, setMassFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getStaffEvents({ group, search: debouncedSearch || undefined, page, perPage: 10 })
      .then((result) => {
        if (active) {
          setEvents(result.data);
          setMeta(result.meta);
        }
      })
      .catch((error) => toast.error(apiMessage(error, "Unable to load events.")))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch, group, page, refreshKey]);

  const submit = async (values: ParishEventInput) => {
    setSaving(true);
    setFieldErrors({});
    try {
      if (editing) {
        const updated = await updateEvent(editing.id, values);
        setEvents((items) => items.map((item) => item.id === updated.id ? updated : item));
        toast.success(`"${updated.title}" has been updated.`);
      } else {
        const created = await createEvent(values);
        toast.success(`"${created.title}" has been added to the parish calendar.`);
        setGroup("events");
        setSearch("");
        setPage(1);
        setRefreshKey((key) => key + 1);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setFieldErrors(error.response.data.errors ?? {});
      } else {
        toast.error(apiMessage(error, "Unable to save the event."));
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await deleteEvent(deleting.id);
      toast.success(`"${deleting.title}" has been deleted.`);
      setDeleting(null);
      if (events.length === 1 && page > 1) setPage((current) => current - 1);
      else setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(apiMessage(error, "Unable to delete the event."));
    } finally {
      setSaving(false);
    }
  };

  const generateMassSchedule = async (values: MassScheduleInput) => {
    setSaving(true);
    setMassFieldErrors({});
    try {
      const result = await createMassSchedule(values);
      if (result.created > 0) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
      setGroup("masses");
      setSearch("");
      setPage(1);
      setRefreshKey((key) => key + 1);
      setMassScheduleOpen(false);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setMassFieldErrors(error.response.data.errors ?? {});
      } else {
        toast.error(apiMessage(error, "Unable to add the Mass schedule."));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <StaffDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#B22222] px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/[0.06]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10"><CalendarDays size={22} /></div>
              <div>
                <h1 className="font-serif text-2xl font-bold sm:text-3xl">Parish Events</h1>
                <p className="mt-1 text-sm text-white/75">Manage the events displayed on parish calendars.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 self-start sm:flex-row sm:self-auto">
              <button type="button" onClick={() => { setMassFieldErrors({}); setMassScheduleOpen(true); }} className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white hover:bg-white/20"><Church size={18} /> Add Mass Schedule</button>
              <button type="button" onClick={() => { setEditing(null); setFieldErrors({}); setFormOpen(true); }} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-[#B22222] hover:bg-white/90"><Plus size={18} /> Add Event</button>
            </div>
          </div>
        </div>

        <section className="flex h-[38rem] flex-col overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-sm lg:h-[clamp(38rem,72vh,48rem)]">
          <div className="shrink-0 border-b border-gray-100 px-5 pt-5 sm:px-7 sm:pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-serif text-xl font-bold text-[#292524]">Event Schedule</h2>
                  {!loading && (
                    <span className="rounded-full bg-[#F5F1EB] px-2.5 py-1 text-xs font-semibold text-[#71685F]">
                      {meta.total}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">Browse parish activities without loading the entire schedule.</p>
              </div>

              <label className="relative block w-full lg:w-80">
                <span className="sr-only">Search schedule</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, details, or location"
                  className="h-11 w-full rounded-xl border border-[#DDD7CF] bg-[#FAF9F7] pl-10 pr-10 text-sm text-[#292524] outline-none transition placeholder:text-gray-400 focus:border-[#B22222]/60 focus:bg-white focus:ring-4 focus:ring-[#B22222]/5"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X size={15} />
                  </button>
                )}
              </label>
            </div>

            <div className="mt-5 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Event schedule groups">
              {eventGroups.map((item) => {
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
                    className={`relative flex shrink-0 items-center gap-2 px-3.5 pb-3 text-sm font-semibold transition sm:px-4 ${
                      active ? "text-[#B22222]" : "text-gray-500 hover:text-gray-800"
                    }`}
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
              <div className="flex h-full items-center justify-center"><p className="text-sm text-gray-400">Loading schedule...</p></div>
            ) : events.length === 0 ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E7E2DA] px-6 text-center text-gray-400">
                {group === "masses" ? <Church className="mb-3 text-gray-300" size={30} /> : group === "past" ? <Archive className="mb-3 text-gray-300" size={30} /> : <CalendarDays className="mb-3 text-gray-300" size={30} />}
                <p className="text-sm font-medium text-gray-500">
                  {debouncedSearch
                    ? `No results found for “${debouncedSearch}”.`
                    : group === "masses"
                      ? "No upcoming Mass schedules."
                      : group === "past"
                        ? "No past events or Masses."
                        : "No upcoming parish events."}
                </p>
                {!debouncedSearch && group === "masses" && <p className="mt-1 text-xs">Use Add Mass Schedule to create the monthly schedule.</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                <article key={event.id} className="flex flex-col gap-4 rounded-2xl border border-[#E7E2DA] bg-white p-4 transition hover:border-[#B22222]/25 hover:shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-5">
                  <div className="flex min-w-0 gap-3.5 sm:gap-4">
                    <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${event.category === "mass" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-[#B22222]"}`}>
                      {event.category === "mass" ? <Church size={19} /> : <CalendarDays size={19} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words font-semibold text-[#292524]">{event.title}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${event.category === "mass" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-[#B22222]"}`}>{event.category === "mass" ? "Mass" : "Event"}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${event.status === "past" ? "bg-gray-100 text-gray-600" : event.status === "ongoing" ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-700"}`}>{event.status}</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 break-words text-sm leading-6 text-gray-600">{event.details}</p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500"><span className="flex items-center gap-1.5"><Clock3 className="shrink-0" size={14} />{formatDateTime(event.startsAt)}{event.endsAt ? ` – ${formatDateTime(event.endsAt)}` : ""}</span>{event.location && <span className="flex min-w-0 items-center gap-1.5"><MapPin className="shrink-0" size={14} /><span className="truncate">{event.location}</span></span>}</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2 self-end sm:self-start"><button type="button" onClick={() => { setEditing(event); setFieldErrors({}); setFormOpen(true); }} aria-label="Edit event" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-[#B22222]"><Pencil size={16} /></button><button type="button" onClick={() => setDeleting(event)} aria-label="Delete event" className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></div>
                </article>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-t border-gray-100 px-5 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p>
              {meta.total > 0 ? `Showing ${meta.from}–${meta.to} of ${meta.total}` : "No records"}
            </p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={loading || meta.current_page <= 1}
                aria-label="Previous page"
                className="grid size-9 place-items-center rounded-lg border border-[#DDD7CF] text-gray-600 transition hover:border-[#B22222]/40 hover:text-[#B22222] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>
              <span className="min-w-24 text-center text-xs font-medium text-gray-600">Page {meta.current_page} of {meta.last_page}</span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))}
                disabled={loading || meta.current_page >= meta.last_page}
                aria-label="Next page"
                className="grid size-9 place-items-center rounded-lg border border-[#DDD7CF] text-gray-600 transition hover:border-[#B22222]/40 hover:text-[#B22222] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {formOpen && <EventFormModal key={editing?.id ?? "new"} initialValues={formValues(editing)} submitting={saving} errors={fieldErrors} onClearError={(field) => setFieldErrors((current) => ({ ...current, [field]: [] }))} onClose={() => { if (!saving) { setFormOpen(false); setEditing(null); setFieldErrors({}); } }} onSubmit={submit} />}
      {massScheduleOpen && <MassScheduleModal submitting={saving} errors={massFieldErrors} onClearError={(field) => setMassFieldErrors((current) => ({ ...current, [field]: [] }))} onClose={() => { if (!saving) { setMassScheduleOpen(false); setMassFieldErrors({}); } }} onSubmit={generateMassSchedule} />}
      <ConfirmDialog open={!!deleting} title="Delete event?" description={`"${deleting?.title}" will be permanently removed from parish calendars.`} confirmLabel="Delete Event" onConfirm={remove} onCancel={() => setDeleting(null)} confirming={saving} />
    </StaffDashboardLayout>
  );
}
