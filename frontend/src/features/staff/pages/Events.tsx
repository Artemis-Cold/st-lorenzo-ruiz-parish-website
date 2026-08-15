import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { CalendarDays, Clock3, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createEvent,
  deleteEvent,
  getStaffEvents,
  updateEvent,
  type ParishEvent,
  type ParishEventInput,
} from "@/services/eventService";
import ConfirmDialog from "../components/announcement/ConfirmDialog";
import EventFormModal from "../components/event/EventFormModal";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ParishEvent | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<ParishEvent | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let active = true;
    getStaffEvents()
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch((error) => toast.error(apiMessage(error, "Unable to load events.")))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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
        setEvents((items) => [created, ...items]);
        toast.success(`"${created.title}" has been added to the parish calendar.`);
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
      setEvents((items) => items.filter((item) => item.id !== deleting.id));
      toast.success(`"${deleting.title}" has been deleted.`);
      setDeleting(null);
    } catch (error) {
      toast.error(apiMessage(error, "Unable to delete the event."));
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
            <button type="button" onClick={() => { setEditing(null); setFieldErrors({}); setFormOpen(true); }} className="flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 py-3 font-semibold text-[#B22222] hover:bg-white/90 sm:self-auto"><Plus size={18} /> Add Event</button>
          </div>
        </div>

        <section className="flex h-[34rem] flex-col rounded-3xl border border-[#E7E2DA] bg-white shadow-sm lg:h-[clamp(34rem,68vh,44rem)]">
          <h2 className="shrink-0 border-b border-gray-100 px-6 py-5 font-serif text-xl font-bold text-[#292524] sm:px-7">Event Schedule</h2>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pr-3 sm:p-6 sm:pr-4 [scrollbar-color:#D6CEC4_transparent] [scrollbar-width:thin]">
            {loading ? (
              <div className="flex h-full items-center justify-center"><p className="text-sm text-gray-400">Loading events...</p></div>
            ) : events.length === 0 ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E7E2DA] px-6 text-center text-gray-400"><CalendarDays className="mb-3 text-gray-300" size={30} /><p className="text-sm">No events yet. Add one to get started.</p></div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                <article key={event.id} className="flex flex-col gap-4 rounded-2xl border border-[#E7E2DA] p-5 transition hover:border-[#B22222]/30 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-[#B22222]"><CalendarDays size={19} /></div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#292524]">{event.title}</h3><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${event.status === "past" ? "bg-gray-100 text-gray-600" : event.status === "ongoing" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{event.status}</span></div>
                      <p className="mt-1 text-sm leading-6 text-gray-600">{event.details}</p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500"><span className="flex items-center gap-1.5"><Clock3 size={14} />{formatDateTime(event.startsAt)}{event.endsAt ? ` – ${formatDateTime(event.endsAt)}` : ""}</span>{event.location && <span className="flex items-center gap-1.5"><MapPin size={14} />{event.location}</span>}</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2 self-end sm:self-start"><button type="button" onClick={() => { setEditing(event); setFieldErrors({}); setFormOpen(true); }} aria-label="Edit event" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-[#B22222]"><Pencil size={16} /></button><button type="button" onClick={() => setDeleting(event)} aria-label="Delete event" className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></div>
                </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {formOpen && <EventFormModal key={editing?.id ?? "new"} initialValues={formValues(editing)} submitting={saving} errors={fieldErrors} onClearError={(field) => setFieldErrors((current) => ({ ...current, [field]: [] }))} onClose={() => { if (!saving) { setFormOpen(false); setEditing(null); setFieldErrors({}); } }} onSubmit={submit} />}
      <ConfirmDialog open={!!deleting} title="Delete event?" description={`"${deleting?.title}" will be permanently removed from parish calendars.`} confirmLabel="Delete Event" onConfirm={remove} onCancel={() => setDeleting(null)} confirming={saving} />
    </StaffDashboardLayout>
  );
}
