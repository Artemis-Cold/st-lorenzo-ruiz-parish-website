import { useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import {
  Ban,
  BellRing,
  CheckCircle2,
  ExternalLink,
  FileWarning,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type { Booking, BookingStatus } from "../../types/booking";
import BookingStatusBadge from "./BookingStatusBadge";
import { formatLabel } from "../../utils/formatLabel";
import {
  requestBookingRequirementResubmission,
  scheduleBookingAppointment,
  sendBookingPaymentReminder,
  sendBookingRequirementsReminder,
} from "@/services/staffManagementService";
import RejectConfirmationButton from "../RejectConfirmationButton";
import {
  publishMarriageBanns,
  removeMarriageBanns,
  type StaffMarriageBann,
} from "@/services/marriageBannService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/alert-dialog";
import { formatPhpCurrency } from "@/utils/currency";

interface Props {
  booking: Booking | null;
  onClose: () => void;
  onUpdateStatus: (id: number, status: BookingStatus) => void;
  onBookingUpdated: (booking: Booking) => void;
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-1 text-sm sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-3">
      <span className="break-words text-gray-500">{label}</span>
      <span className="min-w-0 break-words text-left font-medium leading-5 text-[#292524] sm:text-right">
        {value || "—"}
      </span>
    </div>
  );
}

export default function BookingDetailModal({
  booking,
  onClose,
  onUpdateStatus,
  onBookingUpdated,
}: Props) {
  const [appointments, setAppointments] = useState(
    booking?.details.appointments ?? [],
  );
  const [appointment, setAppointment] = useState({
    type: "seminar" as "seminar" | "priest_interview",
    scheduledAt: "",
    venue: "",
    notes: "",
  });
  const [reminding, setReminding] = useState(false);
  const [paymentReminding, setPaymentReminding] = useState(false);
  const [marriageBanns, setMarriageBanns] = useState<StaffMarriageBann | null>(
    booking?.details.marriageBanns ?? null,
  );
  const [bannsForm, setBannsForm] = useState({
    publicationStart: booking?.details.marriageBanns?.publicationStart ?? "",
    publicationEnd: booking?.details.marriageBanns?.publicationEnd ?? "",
  });
  const [bannsErrors, setBannsErrors] = useState<Record<string, string>>({});
  const [savingBanns, setSavingBanns] = useState(false);
  const [removingBanns, setRemovingBanns] = useState(false);
  const [resubmissionDocument, setResubmissionDocument] = useState<
    Booking["details"]["documents"][number] | null
  >(null);
  const [resubmissionReason, setResubmissionReason] = useState("");
  const [resubmissionError, setResubmissionError] = useState("");
  const [requestingResubmission, setRequestingResubmission] = useState(false);
  if (!booking) return null;

  const { details } = booking;
  const service = details.serviceData;
  const missingRequirements = details.missingRequirements ?? [];
  const canPublishBanns =
    booking.type === "Marriage" &&
    booking.status === "approved" &&
    details.payment.status === "confirmed" &&
    missingRequirements.length === 0;
  const schedule = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const saved = await scheduleBookingAppointment(booking.id, appointment);
      setAppointments((items) => [
        ...items.filter((item) => item.type !== saved.type),
        saved,
      ]);
      toast.success("Schedule saved and SMS queued.");
    } catch {
      toast.error("Unable to save schedule.");
    }
  };
  const remind = async () => {
    setReminding(true);
    try {
      await sendBookingRequirementsReminder(booking.id);
      toast.success("Missing-requirements SMS reminder queued.");
    } catch {
      toast.error("Unable to send the SMS reminder.");
    } finally {
      setReminding(false);
    }
  };
  const remindPayment = async () => {
    setPaymentReminding(true);
    try {
      await sendBookingPaymentReminder(booking.id);
      toast.success("Payment SMS reminder queued.");
    } catch {
      toast.error("Unable to send the payment reminder.");
    } finally {
      setPaymentReminding(false);
    }
  };
  const requestResubmission = async () => {
    const reason = resubmissionReason.trim();

    if (!resubmissionDocument?.reviewKey) {
      setResubmissionError("Select a valid submitted requirement.");
      return;
    }

    if (reason.length < 5) {
      setResubmissionError(
        "Explain why the requirement is invalid using at least 5 characters.",
      );
      return;
    }

    setRequestingResubmission(true);
    setResubmissionError("");
    try {
      const response = await requestBookingRequirementResubmission(
        booking.id,
        resubmissionDocument.reviewKey,
        reason,
      );
      onBookingUpdated(response.data);
      setResubmissionDocument(null);
      setResubmissionReason("");
      toast.success(response.message);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        const fields = error.response.data?.errors as
          Record<string, string[]> | undefined;
        setResubmissionError(
          fields?.reason?.[0] ??
            fields?.document_key?.[0] ??
            "Unable to request resubmission.",
        );
      } else {
        toast.error("Unable to send the resubmission request.");
      }
    } finally {
      setRequestingResubmission(false);
    }
  };
  const saveMarriageBanns = async (event: FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!bannsForm.publicationStart)
      errors.publicationStart = "Select the publication start date.";
    if (!bannsForm.publicationEnd)
      errors.publicationEnd = "Select the publication end date.";
    setBannsErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingBanns(true);
    try {
      const saved = await publishMarriageBanns(booking.id, bannsForm);
      setMarriageBanns(saved);
      setBannsForm({
        publicationStart: saved.publicationStart,
        publicationEnd: saved.publicationEnd,
      });
      setBannsErrors({});
      toast.success("Marriage banns published successfully.");
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        const fields = error.response.data?.errors as
          Record<string, string[]> | undefined;
        setBannsErrors({
          booking: fields?.booking?.[0] ?? "",
          publicationStart: fields?.publicationStart?.[0] ?? "",
          publicationEnd: fields?.publicationEnd?.[0] ?? "",
        });
      } else {
        toast.error("Unable to publish the marriage banns.");
      }
    } finally {
      setSavingBanns(false);
    }
  };
  const unpublishMarriageBanns = async () => {
    setRemovingBanns(true);
    try {
      await removeMarriageBanns(booking.id);
      setMarriageBanns(null);
      toast.success("Marriage banns removed from the landing page.");
    } catch {
      toast.error("Unable to remove the marriage banns.");
    } finally {
      setRemovingBanns(false);
    }
  };

  return (
    <div
      data-app-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4"
    >
      <div
        data-modal-scroll="true"
        className="max-h-[95vh] w-full max-w-2xl overflow-x-hidden overflow-y-auto rounded-2xl bg-white p-4 shadow-lg sm:max-h-[92vh] sm:rounded-3xl sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="min-w-0 pr-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {booking.reference}
            </p>
            <h2 className="mt-1 break-words font-serif text-xl font-bold text-[#292524]">
              {booking.names}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="space-y-3 rounded-2xl border border-[#E7E2DA] p-5">
            <h3 className="font-semibold text-[#292524]">Booking summary</h3>
            <Detail
              label="Status"
              value={<BookingStatusBadge status={booking.status} />}
            />
            <Detail label="Service" value={booking.type} />
            <Detail label="Submitted by" value={details.submittedBy} />
            <Detail label="Contact" value={booking.contactNumber} />
            <Detail
              label="Date"
              value={details.schedule.date ?? booking.date}
            />
            <Detail
              label="Time"
              value={
                details.schedule.startTime
                  ? `${details.schedule.startTime} – ${details.schedule.endTime}`
                  : "—"
              }
            />
            <Detail label="Remarks" value={details.remarks} />
          </section>

          <section className="space-y-3 rounded-2xl border border-[#E7E2DA] p-5">
            <h3 className="font-semibold text-[#292524]">Payment breakdown</h3>
            <Detail label="Package" value={details.packageName} />
            <Detail
              label="Base amount"
              value={formatPhpCurrency(details.baseAmount)}
            />
            {details.inclusions.map((inclusion) => (
              <Detail
                key={inclusion.name}
                label={inclusion.name}
                value={formatPhpCurrency(inclusion.price)}
              />
            ))}
            {details.addons.map((addon) => (
              <Detail
                key={addon.name}
                label={addon.name}
                value={formatPhpCurrency(addon.price)}
              />
            ))}
            {details.fees.map((fee) => (
              <Detail
                key={fee.name}
                label={`${fee.name}${fee.quantity > 1 ? ` × ${fee.quantity}` : ""}`}
                value={formatPhpCurrency(fee.subtotal)}
              />
            ))}
            <div className="border-t border-[#E7E2DA] pt-3">
              <Detail
                label="Total"
                value={
                  <span className="text-[#B22222]">
                    {formatPhpCurrency(booking.amount)}
                  </span>
                }
              />
            </div>
            <Detail
              label="Payment status"
              value={formatLabel(details.payment.status)}
            />
            <Detail
              label="Payment method"
              value={
                details.payment.method
                  ? formatLabel(details.payment.method)
                  : null
              }
            />
            {details.payment.method === "gcash" && (
              <Detail
                label="GCash reference"
                value={details.payment.referenceNumber}
              />
            )}
            {details.payment.officialReceiptNumber && (
              <Detail
                label="Official receipt"
                value={details.payment.officialReceiptNumber}
              />
            )}
            {details.payment.receipt && (
              <Detail
                label="Receipt"
                value={
                  <a
                    href={details.payment.receipt.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#B22222] hover:underline"
                  >
                    View receipt <ExternalLink size={13} />
                  </a>
                }
              />
            )}
            {details.payment.status === "pending_verification" && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                The submitted payment is awaiting verification in Transactions.
              </p>
            )}
            {details.payment.status === "awaiting_payment" && (
              <p className="rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-800">
                The parishioner selected cash and must pay at the parish office.
                Confirm it through Transactions after issuing an official
                receipt.
              </p>
            )}
            {details.payment.status === "rejected" && (
              <p className="rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">
                The payment was rejected. The parishioner may submit a corrected
                GCash details or switch to cash payment.
              </p>
            )}
            {details.payment.canRemind && (
              <button
                type="button"
                disabled={paymentReminding}
                onClick={remindPayment}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B22222] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <BellRing size={16} />{" "}
                {paymentReminding ? "Sending..." : "Send Payment SMS Reminder"}
              </button>
            )}
          </section>
        </div>

        {service.applicants?.map((person) => (
          <section
            key={person.role}
            className="mt-4 space-y-3 rounded-2xl border border-[#E7E2DA] p-5"
          >
            <h3 className="font-semibold text-[#292524]">
              {person.role} information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Name" value={person.name} />
              <Detail label="Age" value={person.age} />
              <Detail label="Contact" value={person.contactNumber} />
              <Detail label="Address" value={person.address} />
              <Detail label="Baptized in" value={person.baptizedIn} />
              <Detail label="Confirmed in" value={person.confirmedIn} />
              <Detail label="Father" value={person.fatherName} />
              <Detail label="Mother" value={person.motherName} />
              <Detail
                label="Previous church"
                value={person.previousMarriage.churchName}
              />
              <Detail label="Priest" value={person.previousMarriage.priest} />
            </div>
          </section>
        ))}

        {!!service.sponsors?.length && (
          <section className="mt-4 space-y-3 rounded-2xl border border-[#E7E2DA] p-5">
            <h3 className="font-semibold text-[#292524]">Principal sponsors</h3>
            {service.sponsors.map((sponsor, sponsorIndex) => (
              <Detail
                key={`${sponsor.role}-${sponsor.name}-${sponsorIndex}`}
                label={`Sponsor ${sponsorIndex + 1} — ${
                  sponsor.role === "godfather"
                    ? "Godfather (Ninong)"
                    : "Godmother (Ninang)"
                }`}
                value={`${sponsor.name} — ${sponsor.residence}${
                  sponsor.requirementType
                    ? ` — ${formatLabel(sponsor.requirementType)}`
                    : ""
                }`}
              />
            ))}
          </section>
        )}

        {booking.type === "Marriage" && (
          <section className="mt-4 rounded-2xl border border-[#D4AF37]/35 bg-[#FFFDF7] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-[#292524]">Marriage Banns</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Publish this couple on the landing page for a controlled date
                  range.
                </p>
              </div>
              {marriageBanns && (
                <span className="w-fit rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Published
                </span>
              )}
            </div>

            {!canPublishBanns && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-semibold">
                  {marriageBanns
                    ? "This publication can no longer be updated."
                    : "Publication is not available yet."}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
                  <li>Wedding booking must be approved.</li>
                  <li>GCash payment must be confirmed.</li>
                  <li>All wedding requirements must be complete.</li>
                </ul>
              </div>
            )}

            {(canPublishBanns || marriageBanns) && (
              <form
                onSubmit={saveMarriageBanns}
                className="mt-4 grid gap-3 sm:grid-cols-2"
              >
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Publication start
                  </label>
                  <input
                    type="date"
                    disabled={!canPublishBanns}
                    min={new Date().toISOString().slice(0, 10)}
                    value={bannsForm.publicationStart}
                    onChange={(event) => {
                      setBannsForm((current) => ({
                        ...current,
                        publicationStart: event.target.value,
                      }));
                      setBannsErrors((current) => ({
                        ...current,
                        publicationStart: "",
                        booking: "",
                      }));
                    }}
                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#B22222] disabled:cursor-not-allowed disabled:bg-gray-100 ${bannsErrors.publicationStart ? "border-red-400" : "border-gray-300"}`}
                  />
                  {bannsErrors.publicationStart && (
                    <p className="mt-1 text-xs text-red-600">
                      {bannsErrors.publicationStart}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Publication end
                  </label>
                  <input
                    type="date"
                    disabled={!canPublishBanns}
                    min={
                      bannsForm.publicationStart ||
                      new Date().toISOString().slice(0, 10)
                    }
                    value={bannsForm.publicationEnd}
                    onChange={(event) => {
                      setBannsForm((current) => ({
                        ...current,
                        publicationEnd: event.target.value,
                      }));
                      setBannsErrors((current) => ({
                        ...current,
                        publicationEnd: "",
                        booking: "",
                      }));
                    }}
                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#B22222] disabled:cursor-not-allowed disabled:bg-gray-100 ${bannsErrors.publicationEnd ? "border-red-400" : "border-gray-300"}`}
                  />
                  {bannsErrors.publicationEnd && (
                    <p className="mt-1 text-xs text-red-600">
                      {bannsErrors.publicationEnd}
                    </p>
                  )}
                </div>
                {bannsErrors.booking && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 sm:col-span-2">
                    {bannsErrors.booking}
                  </p>
                )}
                <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={savingBanns || !canPublishBanns}
                    className="flex-1 rounded-xl bg-[#B22222] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingBanns
                      ? "Saving..."
                      : marriageBanns
                        ? "Update Publication"
                        : "Publish Marriage Banns"}
                  </button>
                  {marriageBanns && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          disabled={removingBanns}
                          className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove marriage banns?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            The couple will no longer appear in the Marriage
                            Banns section of the landing page.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep published</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void unpublishMarriageBanns()}
                            className="bg-[#B22222] hover:bg-[#991B1B]"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </form>
            )}
          </section>
        )}

        {(booking.type === "Marriage" || booking.type === "Baptism") && (
          <section className="mt-4 min-w-0 space-y-4 rounded-2xl border border-[#E7E2DA] p-4 sm:p-5">
            <div>
              <h3 className="font-semibold text-[#292524]">
                {booking.type === "Baptism"
                  ? "Baptism seminar and SMS"
                  : "Wedding schedules and SMS"}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Saving a schedule queues an SMS notification for the
                parishioner.
              </p>
            </div>
            {appointments.map((item) => (
              <Detail
                key={item.type}
                label={
                  booking.type === "Baptism"
                    ? "Baptism seminar"
                    : formatLabel(item.type)
                }
                value={`${new Date(item.scheduledAt).toLocaleString()} — ${item.venue}`}
              />
            ))}
            <form
              onSubmit={schedule}
              className="grid min-w-0 gap-3 md:grid-cols-2"
            >
              {booking.type === "Marriage" ? (
                <select
                  value={appointment.type}
                  onChange={(e) =>
                    setAppointment({
                      ...appointment,
                      type: e.target.value as typeof appointment.type,
                    })
                  }
                  className="min-w-0 w-full rounded-xl border px-3 py-2"
                >
                  <option value="seminar">Wedding Seminar</option>
                  <option value="priest_interview">Priest Interview</option>
                </select>
              ) : (
                <div className="min-w-0 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                  Baptism Seminar
                </div>
              )}
              <input
                type="datetime-local"
                required
                value={appointment.scheduledAt}
                onChange={(e) =>
                  setAppointment({
                    ...appointment,
                    scheduledAt: e.target.value,
                  })
                }
                className="min-w-0 w-full max-w-full rounded-xl border px-3 py-2"
              />
              <input
                required
                placeholder="Venue"
                value={appointment.venue}
                onChange={(e) =>
                  setAppointment({ ...appointment, venue: e.target.value })
                }
                className="min-w-0 w-full rounded-xl border px-3 py-2"
              />
              <input
                placeholder="Notes (optional)"
                value={appointment.notes}
                onChange={(e) =>
                  setAppointment({ ...appointment, notes: e.target.value })
                }
                className="min-w-0 w-full rounded-xl border px-3 py-2"
              />
              <button
                type="submit"
                className="min-w-0 whitespace-normal rounded-xl bg-[#B22222] px-4 py-2.5 text-center font-semibold leading-5 text-white md:col-span-2"
              >
                Save Schedule &amp; Notify
              </button>
            </form>
          </section>
        )}

        {service.deceased && (
          <section className="mt-4 space-y-3 rounded-2xl border border-[#E7E2DA] p-5">
            <h3 className="font-semibold text-[#292524]">
              Deceased and informant information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Name" value={service.deceased.name} />
              <Detail label="Age" value={service.deceased.age} />
              <Detail label="Birth date" value={service.deceased.birthDate} />
              <Detail
                label="Cause of death"
                value={service.deceased.deathCause}
              />
              <Detail label="Address" value={service.deceased.address} />
              <Detail
                label="Informant"
                value={service.deceased.informantName}
              />
              <Detail label="Father" value={service.deceased.fatherName} />
              <Detail label="Mother" value={service.deceased.motherName} />
              <Detail label="Spouse" value={service.deceased.spouseName} />
              <Detail
                label="Relationship"
                value={service.deceased.informantRelationship}
              />
              <Detail
                label="Informant contact"
                value={service.deceased.informantContactNumber}
              />
              <Detail
                label="Children"
                value={service.deceased.children.join(", ")}
              />
              <Detail
                label="Sacraments"
                value={Object.entries(service.deceased.sacraments)
                  .filter(([, received]) => received)
                  .map(([name]) => formatLabel(name))
                  .join(", ")}
              />
              <Detail
                label="Attends Mass"
                value={formatLabel(service.deceased.churchLife.attendsMass)}
              />
              <Detail
                label="Confesses"
                value={formatLabel(service.deceased.churchLife.confesses)}
              />
            </div>
            <div className="mt-4 rounded-xl bg-[#FAF8F5] p-4">
              <p className="text-sm text-gray-500">Characteristics</p>
              <p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-6 text-[#292524]">
                {service.deceased.characteristics || "—"}
              </p>
            </div>
          </section>
        )}

        {service.baptizand && (
          <section className="mt-4 space-y-4 rounded-2xl border border-[#E7E2DA] p-5">
            <h3 className="font-semibold text-[#292524]">
              Baptism information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Baptizand" value={service.baptizand.name} />
              <Detail label="Birth date" value={service.baptizand.birthDate} />
              <Detail
                label="Birth place"
                value={service.baptizand.birthPlace}
              />
              <Detail label="Gender" value={service.baptizand.gender} />
              <Detail label="Address" value={service.baptizand.address} />
              <Detail label="Contact" value={service.baptizand.contactNumber} />
            </div>
            {service.baptizand.parents.map((parent) => (
              <Detail
                key={parent.relationship}
                label={parent.relationship}
                value={`${parent.name} — ${parent.birthPlace}`}
              />
            ))}
            {service.baptizand.godParents.map((person, index) => (
              <Detail
                key={`${person.role}-${index}`}
                label={person.role}
                value={`${person.name} — ${person.residence}${
                  person.requirementType
                    ? ` — ${formatLabel(person.requirementType)}`
                    : ""
                }`}
              />
            ))}
          </section>
        )}

        <section className="mt-4 rounded-2xl border border-[#E7E2DA] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#B22222]/8 text-[#B22222]">
              <FileWarning size={19} />
            </span>
            <div>
              <h3 className="font-semibold text-[#292524]">
                Submitted requirements
              </h3>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Review each file. If a requirement is unclear or invalid,
                request a replacement and notify the parishioner by SMS.
              </p>
            </div>
          </div>
          {details.documents.length ? (
            <div className="mt-4 space-y-3">
              {details.documents.map((document) => (
                <div
                  key={`${document.reviewKey ?? document.type}-${document.fileName}`}
                  className={`rounded-xl border p-3.5 ${document.status === "rejected" ? "border-red-200 bg-red-50/70" : "border-gray-200 bg-[#FAF8F5]"}`}
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#292524]">
                          {formatLabel(document.type)}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${document.status === "rejected" ? "bg-red-100 text-red-700" : document.status === "approved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}
                        >
                          {formatLabel(document.status)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {document.fileName}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#B22222] transition hover:border-red-200 hover:bg-red-50"
                      >
                        View file <ExternalLink size={13} />
                      </a>
                      {document.reviewKey &&
                        document.status !== "rejected" &&
                        (booking.status === "pending" ||
                          booking.status === "paid") && (
                          <button
                            type="button"
                            onClick={() => {
                              setResubmissionDocument(document);
                              setResubmissionReason("");
                              setResubmissionError("");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#B22222] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#991B1B]"
                          >
                            Request resubmission
                          </button>
                        )}
                    </div>
                  </div>
                  {document.status === "rejected" && document.remarks && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs leading-5 text-red-700">
                      <span className="font-semibold">Reason:</span>{" "}
                      {document.remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400">
              No requirements attached.
            </p>
          )}
        </section>

        <AlertDialog
          open={resubmissionDocument !== null}
          onOpenChange={(open) => {
            if (!open && !requestingResubmission) {
              setResubmissionDocument(null);
              setResubmissionReason("");
              setResubmissionError("");
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Request a replacement file?</AlertDialogTitle>
              <AlertDialogDescription>
                The selected requirement will be marked invalid and the
                parishioner will receive an SMS asking them to resubmit it from
                My Profile.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="rounded-xl border border-[#E7E2DA] bg-[#FAF8F5] p-3">
              <p className="text-xs font-medium text-gray-500">
                Selected requirement
              </p>
              <p className="mt-1 text-sm font-semibold text-[#292524]">
                {resubmissionDocument
                  ? formatLabel(resubmissionDocument.type)
                  : "—"}
              </p>
            </div>

            <div>
              <label
                htmlFor="requirement-resubmission-reason"
                className="mb-1.5 block text-sm font-semibold text-[#292524]"
              >
                Reason for resubmission <span className="text-red-600">*</span>
              </label>
              <textarea
                id="requirement-resubmission-reason"
                rows={4}
                maxLength={300}
                value={resubmissionReason}
                disabled={requestingResubmission}
                onChange={(event) => {
                  setResubmissionReason(event.target.value);
                  setResubmissionError("");
                }}
                placeholder="Example: The uploaded image is blurred and the document details cannot be verified."
                className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-[#B22222] ${resubmissionError ? "border-red-400" : "border-gray-300"}`}
              />
              <div className="mt-1 flex items-start justify-between gap-3">
                <p className="text-xs text-red-600">{resubmissionError}</p>
                <span className="shrink-0 text-xs text-gray-400">
                  {resubmissionReason.length}/300
                </span>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={requestingResubmission}>
                Cancel
              </AlertDialogCancel>
              <button
                type="button"
                disabled={requestingResubmission}
                onClick={() => void requestResubmission()}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#B22222] px-4 text-sm font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {requestingResubmission
                  ? "Sending notification..."
                  : "Mark invalid & notify"}
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {missingRequirements.length > 0 && (
          <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-semibold text-amber-900">
              Missing requirements
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
              {missingRequirements.map((requirement) => (
                <li key={requirement.key}>{requirement.label}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-medium text-amber-900">
              Approval is disabled until all required files are submitted.
            </p>
            <button
              type="button"
              disabled={reminding}
              onClick={remind}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <BellRing size={16} />{" "}
              {reminding ? "Sending..." : "Send SMS Reminder"}
            </button>
          </section>
        )}

        {(booking.status === "pending" ||
          booking.status === "paid" ||
          booking.status === "approved") && (
          <div className="mt-6 space-y-2.5">
            {(booking.status === "pending" || booking.status === "paid") && (
              <div className="flex gap-2.5">
                <RejectConfirmationButton
                  itemLabel="booking"
                  onConfirm={() => onUpdateStatus(booking.id, "rejected")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                />
                {booking.status === "paid" && (
                  <button
                    disabled={missingRequirements.length > 0}
                    onClick={() => onUpdateStatus(booking.id, "approved")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B22222] py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CheckCircle2 size={18} /> Approve
                  </button>
                )}
              </div>
            )}
            {booking.status === "approved" && (
              <button
                onClick={() => onUpdateStatus(booking.id, "completed")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white"
              >
                <CheckCircle2 size={18} /> Mark as Completed
              </button>
            )}
            <button
              onClick={() => onUpdateStatus(booking.id, "cancelled")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-semibold text-red-600"
            >
              <Ban size={18} /> Cancel Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
