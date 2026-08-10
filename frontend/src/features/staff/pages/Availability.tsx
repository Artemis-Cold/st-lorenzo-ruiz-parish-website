import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarClock, CalendarPlus, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import { createStaffAvailability, deleteStaffAvailability, getStaffAvailability, updateStaffAvailability, type StaffAvailabilitySlot } from "@/services/staffAvailabilityService";

const today = new Date().toISOString().slice(0, 10);

const serviceBadgeStyles: Record<StaffAvailabilitySlot["serviceCode"], string> = {
  baptism: "bg-sky-50 text-sky-700 ring-sky-200",
  wedding: "bg-rose-50 text-rose-700 ring-rose-200",
  funeral: "bg-violet-50 text-violet-700 ring-violet-200",
};

export default function Availability() {
  const [slots, setSlots] = useState<StaffAvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ serviceCode: "baptism" as "wedding" | "baptism" | "funeral", date: "", startTime: "", endTime: "", capacity: 1 });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const load = () => getStaffAvailability().then(setSlots).catch(() => toast.error("Unable to load availability.")).finally(() => setLoading(false));
  useEffect(() => { void load(); }, []);

  const grouped = useMemo(() => Object.entries(slots.reduce<Record<string, StaffAvailabilitySlot[]>>((days, slot) => {
    (days[slot.date] ??= []).push(slot);
    return days;
  }, {})), [slots]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors({});

    const overlappingSlot = slots.find((slot) =>
      slot.date === form.date
      && slot.startTime.slice(0, 5) < form.endTime
      && slot.endTime.slice(0, 5) > form.startTime
    );

    if (overlappingSlot && form.startTime && form.endTime) {
      const time = `${overlappingSlot.startTime.slice(0, 5)}–${overlappingSlot.endTime.slice(0, 5)}`;
      setErrors({
        startTime: [`This time overlaps the ${overlappingSlot.serviceName} slot at ${time}.`],
        endTime: ["Choose a time range that does not overlap any parish service."],
      });
      return;
    }

    try {
      await createStaffAvailability(form);
      toast.success(`${form.serviceCode.charAt(0).toUpperCase() + form.serviceCode.slice(1)} availability saved.`);
      setForm((current) => ({ ...current, date: "", startTime: "", endTime: "" }));
      await load();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors ?? {});
      } else {
        toast.error("Unable to save availability. Please try again.");
      }
    }
  };

  const toggle = async (slot: StaffAvailabilitySlot) => {
    try { const updated = await updateStaffAvailability(slot.id, { isActive: !slot.isActive }); setSlots((items) => items.map((item) => item.id === slot.id ? updated : item)); }
    catch { toast.error("Unable to update this slot."); }
  };

  const remove = async (slot: StaffAvailabilitySlot) => {
    try { await deleteStaffAvailability(slot.id); setSlots((items) => items.filter((item) => item.id !== slot.id)); toast.success("Availability removed."); }
    catch { toast.error("Slots with bookings cannot be deleted. Disable the slot instead."); }
  };

  return <StaffDashboardLayout><div className="space-y-6">
    <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#B22222] to-[#741515] px-7 py-9 text-white shadow-lg sm:px-10"><div className="flex items-center gap-4"><div className="rounded-2xl bg-white/15 p-3"><CalendarClock size={28} /></div><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F5D76E]">Schedule control</p><h1 className="mt-1 font-serif text-3xl font-bold">Booking Availability</h1><p className="mt-2 max-w-2xl text-sm text-white/75">Configure parish service schedules without duplicate or overlapping time slots.</p></div></div></header>

    <div className="grid items-start gap-6 xl:grid-cols-[380px_1fr]">
      <form onSubmit={submit} noValidate className="space-y-5 rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-sm xl:sticky xl:top-6"><div className="flex items-center gap-3"><CalendarPlus className="text-[#B22222]" /><h2 className="font-serif text-xl font-bold">Add Availability</h2></div>
        <label className="block text-sm font-medium">Parish service<select value={form.serviceCode} onChange={(event) => setForm({ ...form, serviceCode: event.target.value as typeof form.serviceCode })} className={`mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#B22222] ${errors.serviceCode ? "border-red-400" : "border-gray-300"}`}><option value="baptism">Baptism</option><option value="wedding">Wedding</option><option value="funeral">Funeral</option></select>{errors.serviceCode?.[0] && <p className="mt-1 text-xs text-red-600">{errors.serviceCode[0]}</p>}</label>
        <label className="block text-sm font-medium">Date<input type="date" min={today} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={`mt-2 w-full rounded-xl border px-4 py-3 ${errors.date ? "border-red-400" : "border-gray-300"}`} />{errors.date?.[0] && <p className="mt-1 text-xs text-red-600">{errors.date[0]}</p>}</label>
        <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Start<input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} className={`mt-2 w-full rounded-xl border px-3 py-3 ${errors.startTime ? "border-red-400" : "border-gray-300"}`} />{errors.startTime?.[0] && <p className="mt-1 text-xs text-red-600">{errors.startTime[0]}</p>}</label><label className="block text-sm font-medium">End<input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} className={`mt-2 w-full rounded-xl border px-3 py-3 ${errors.endTime ? "border-red-400" : "border-gray-300"}`} />{errors.endTime?.[0] && <p className="mt-1 text-xs text-red-600">{errors.endTime[0]}</p>}</label></div>
        <label className="block text-sm font-medium">Slot capacity<input type="number" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })} className={`mt-2 w-full rounded-xl border px-4 py-3 ${errors.capacity ? "border-red-400" : "border-gray-300"}`} />{errors.capacity?.[0] && <p className="mt-1 text-xs text-red-600">{errors.capacity[0]}</p>}</label>
        <button className="w-full rounded-xl bg-[#B22222] py-3 font-semibold text-white hover:bg-[#8F1B1B]">Save Availability</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-sm"><div className="border-b border-gray-100 px-6 py-5"><h2 className="font-serif text-xl font-bold">Upcoming Slots</h2><p className="mt-1 text-sm text-gray-500">Disable a slot to hide it from parishioners without deleting its history.</p></div>
        <div className="max-h-[65vh] min-h-64 overflow-y-auto overscroll-contain scroll-smooth px-6 py-5 pr-4 [scrollbar-color:#D6CEC4_transparent] [scrollbar-width:thin]">
          {loading ? <p className="py-12 text-center text-gray-400">Loading availability...</p> : grouped.length === 0 ? <p className="rounded-2xl border border-dashed py-12 text-center text-gray-400">No upcoming availability configured.</p> : <div className="space-y-6">{grouped.map(([date, daySlots]) => <div key={date}><h3 className="sticky top-0 z-10 mb-3 border-b border-red-100 bg-white/95 py-2 text-sm font-bold text-[#B22222] backdrop-blur-sm">{new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3><div className="grid gap-3 lg:grid-cols-2">{daySlots?.map((slot) => <article key={slot.id} className={`rounded-2xl border p-4 ${slot.isActive ? "border-gray-200" : "border-gray-200 bg-gray-50 opacity-65"}`}><div className="flex items-start justify-between gap-3"><div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${serviceBadgeStyles[slot.serviceCode]}`}>{slot.serviceName}</span><p className="mt-3 font-semibold">{slot.startTime}–{slot.endTime}</p><p className="mt-1 text-xs text-gray-500">{slot.booked} booked · {slot.capacity} capacity</p></div><div className="flex gap-1"><button title={slot.isActive ? "Disable" : "Enable"} onClick={() => toggle(slot)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><Power size={17} /></button><button title="Delete" onClick={() => remove(slot)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={17} /></button></div></div></article>)}</div></div>)}</div>}
        </div>
      </section>
    </div>
  </div></StaffDashboardLayout>;
}
