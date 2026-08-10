import { Ban, CheckCircle2, X, XCircle } from "lucide-react";

import type { Booking, BookingStatus } from "../../types/booking";
import BookingStatusBadge from "./BookingStatusBadge";
import { formatLabel } from "../../utils/formatLabel";

interface Props {
  booking: Booking | null;
  onClose: () => void;
  onUpdateStatus: (id: number, status: BookingStatus) => void;
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="text-right font-medium text-[#292524]">{value || "—"}</span>
    </div>
  );
}

export default function BookingDetailModal({ booking, onClose, onUpdateStatus }: Props) {
  if (!booking) return null;

  const { details } = booking;
  const service = details.serviceData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-lg">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{booking.reference}</p>
            <h2 className="mt-1 font-serif text-xl font-bold text-[#292524]">{booking.names}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="space-y-3 rounded-2xl border border-[#E7E2DA] p-5">
            <h3 className="font-semibold text-[#292524]">Booking summary</h3>
            <Detail label="Status" value={<BookingStatusBadge status={booking.status} />} />
            <Detail label="Service" value={booking.type} />
            <Detail label="Submitted by" value={details.submittedBy} />
            <Detail label="Contact" value={booking.contactNumber} />
            <Detail label="Date" value={details.schedule.date ?? booking.date} />
            <Detail label="Time" value={details.schedule.startTime ? `${details.schedule.startTime} – ${details.schedule.endTime}` : "—"} />
            <Detail label="Remarks" value={details.remarks} />
          </section>

          <section className="space-y-3 rounded-2xl border border-[#E7E2DA] p-5">
            <h3 className="font-semibold text-[#292524]">Payment breakdown</h3>
            <Detail label="Package" value={details.packageName} />
            <Detail label="Base amount" value={`₱${details.baseAmount.toLocaleString()}.00`} />
            {details.inclusions.map((inclusion) => <Detail key={inclusion.name} label={inclusion.name} value={`₱${inclusion.price.toLocaleString()}.00`} />)}
            {details.addons.map((addon) => <Detail key={addon.name} label={addon.name} value={`₱${addon.price.toLocaleString()}.00`} />)}
            <div className="border-t border-[#E7E2DA] pt-3"><Detail label="Total" value={<span className="text-[#B22222]">₱{booking.amount.toLocaleString()}.00</span>} /></div>
          </section>
        </div>

        {service.applicants?.map((person) => (
          <section key={person.role} className="mt-4 space-y-3 rounded-2xl border border-[#E7E2DA] p-5">
            <h3 className="font-semibold text-[#292524]">{person.role} information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Name" value={person.name} /><Detail label="Age" value={person.age} />
              <Detail label="Contact" value={person.contactNumber} /><Detail label="Address" value={person.address} />
              <Detail label="Baptized in" value={person.baptizedIn} /><Detail label="Confirmed in" value={person.confirmedIn} />
              <Detail label="Father" value={person.fatherName} /><Detail label="Mother" value={person.motherName} />
              <Detail label="Previous church" value={person.previousMarriage.churchName} /><Detail label="Priest" value={person.previousMarriage.priest} />
            </div>
          </section>
        ))}

        {service.deceased && (
          <section className="mt-4 space-y-3 rounded-2xl border border-[#E7E2DA] p-5">
            <h3 className="font-semibold text-[#292524]">Deceased and informant information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Name" value={service.deceased.name} /><Detail label="Age" value={service.deceased.age} />
              <Detail label="Birth date" value={service.deceased.birthDate} /><Detail label="Cause of death" value={service.deceased.deathCause} />
              <Detail label="Address" value={service.deceased.address} /><Detail label="Informant" value={service.deceased.informantName} />
              <Detail label="Father" value={service.deceased.fatherName} /><Detail label="Mother" value={service.deceased.motherName} />
              <Detail label="Spouse" value={service.deceased.spouseName} />
              <Detail label="Relationship" value={service.deceased.informantRelationship} /><Detail label="Informant contact" value={service.deceased.informantContactNumber} />
              <Detail label="Children" value={service.deceased.children.join(", ")} />
              <Detail label="Sacraments" value={Object.entries(service.deceased.sacraments).filter(([, received]) => received).map(([name]) => formatLabel(name)).join(", ")} />
            </div>
          </section>
        )}

        {service.baptizand && (
          <section className="mt-4 space-y-4 rounded-2xl border border-[#E7E2DA] p-5">
            <h3 className="font-semibold text-[#292524]">Baptism information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Baptizand" value={service.baptizand.name} /><Detail label="Birth date" value={service.baptizand.birthDate} />
              <Detail label="Birth place" value={service.baptizand.birthPlace} /><Detail label="Gender" value={service.baptizand.gender} />
              <Detail label="Address" value={service.baptizand.address} /><Detail label="Contact" value={service.baptizand.contactNumber} />
            </div>
            {service.baptizand.parents.map((parent) => <Detail key={parent.relationship} label={parent.relationship} value={`${parent.name} — ${parent.birthPlace}`} />)}
            {service.baptizand.godParents.map((person, index) => <Detail key={`${person.role}-${index}`} label={person.role} value={`${person.name} — ${person.residence}`} />)}
          </section>
        )}

        <section className="mt-4 space-y-2 rounded-2xl border border-[#E7E2DA] p-5">
          <h3 className="font-semibold text-[#292524]">Submitted documents</h3>
          {details.documents.length ? details.documents.map((document) => <Detail key={`${document.type}-${document.fileName}`} label={formatLabel(document.type)} value={<a href={document.url} target="_blank" rel="noreferrer" className="text-[#B22222] hover:underline">{document.fileName} ({formatLabel(document.status)})</a>} />) : <p className="text-sm text-gray-400">No documents attached.</p>}
        </section>

        {(booking.status === "pending" || booking.status === "approved") && (
          <div className="mt-6 space-y-2.5">
            {booking.status === "pending" && <div className="flex gap-2.5">
              <button onClick={() => onUpdateStatus(booking.id, "rejected")} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-semibold text-red-600"><XCircle size={18} /> Reject</button>
              <button onClick={() => onUpdateStatus(booking.id, "approved")} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B22222] py-3 font-semibold text-white"><CheckCircle2 size={18} /> Approve</button>
            </div>}
            {booking.status === "approved" && <button onClick={() => onUpdateStatus(booking.id, "completed")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white"><CheckCircle2 size={18} /> Mark as Completed</button>}
            <button onClick={() => onUpdateStatus(booking.id, "cancelled")} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-semibold text-red-600"><Ban size={18} /> Cancel Booking</button>
          </div>
        )}
      </div>
    </div>
  );
}
