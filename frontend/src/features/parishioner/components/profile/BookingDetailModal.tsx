import { useEffect, useState } from "react";
import { CalendarDays, ExternalLink, LoaderCircle, X } from "lucide-react";

import {
  getParishionerBooking,
  type ParishionerBookingDetail,
} from "@/services/parishionerBookingService";

const label = (value: string) =>
  value.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

export default function BookingDetailModal({
  bookingId,
  onClose,
}: {
  bookingId: number | null;
  onClose: () => void;
}) {
  const [booking, setBooking] = useState<ParishionerBookingDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    setBooking(null);
    setError("");
    getParishionerBooking(bookingId)
      .then(setBooking)
      .catch(() => setError("Unable to load this booking's information."));
  }, [bookingId]);

  if (!bookingId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B22222]">Booking information</p>
            <h2 className="mt-1 font-serif text-2xl font-bold">{booking?.service ?? "Loading booking..."}</h2>
            {booking && <p className="mt-1 text-sm text-gray-500">{booking.reference}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        </div>

        {!booking && !error && <div className="flex min-h-48 items-center justify-center text-gray-500"><LoaderCircle className="mr-2 animate-spin" /> Loading details...</div>}
        {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

        {booking && (
          <div className="mt-6 space-y-5">
            <div className="grid gap-3 rounded-2xl bg-[#FAF8F5] p-5 sm:grid-cols-2">
              <div><p className="text-xs text-gray-500">Status</p><p className="font-semibold text-[#B22222]">{label(booking.status)}</p></div>
              <div><p className="text-xs text-gray-500">Submitted</p><p className="font-medium">{new Date(booking.submittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p></div>
              {booking.schedule.date && <div className="sm:col-span-2"><p className="text-xs text-gray-500">Schedule</p><p className="flex items-center gap-2 font-medium"><CalendarDays size={16} /> {new Date(`${booking.schedule.date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}{booking.schedule.startTime ? `, ${booking.schedule.startTime}` : ""}</p></div>}
            </div>

            {booking.package && (
              <section className="rounded-2xl border p-5">
                <h3 className="font-semibold">Package and payment</h3>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p><span className="text-gray-500">Package:</span> {booking.package.name}</p><p><span className="text-gray-500">Total:</span> ₱{booking.package.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
                {booking.package.inclusions.length > 0 && <p className="mt-2 text-sm"><span className="text-gray-500">Inclusions:</span> {booking.package.inclusions.join(", ")}</p>}
                {booking.package.addons.length > 0 && <p className="mt-2 text-sm"><span className="text-gray-500">Add-ons:</span> {booking.package.addons.map((addon) => addon.name).join(", ")}</p>}
              </section>
            )}

            {booking.sections.map((section) => (
              <section key={section.title} className="rounded-2xl border p-5">
                <h3 className="font-semibold">{section.title}</h3>
                <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {section.fields.map((field) => <div key={`${section.title}-${field.label}`}><dt className="text-xs text-gray-500">{field.label}</dt><dd className="mt-0.5 break-words text-sm font-medium">{field.value}</dd></div>)}
                </dl>
              </section>
            ))}

            {booking.documents.length > 0 && (
              <section className="rounded-2xl border p-5">
                <h3 className="font-semibold">Submitted files</h3>
                <div className="mt-3 space-y-2">{booking.documents.map((document) => <a key={`${document.type}-${document.fileName}`} href={document.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-sm text-[#B22222] hover:bg-red-50"><span>{label(document.type)} — {document.fileName}</span><ExternalLink size={16} /></a>)}</div>
              </section>
            )}

            {booking.remarks && <section className="rounded-2xl border p-5"><h3 className="font-semibold">Remarks</h3><p className="mt-2 text-sm text-gray-600">{booking.remarks}</p></section>}
          </div>
        )}
      </div>
    </div>
  );
}
