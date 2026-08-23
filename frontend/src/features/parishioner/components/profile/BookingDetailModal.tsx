import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { CalendarClock, CalendarDays, CreditCard, ExternalLink, FileText, FileUp, LoaderCircle, Trash2, X } from "lucide-react";

import {
  getParishionerBooking,
  submitParishionerBookingPayment,
  uploadParishionerBookingDocument,
  type ParishionerBookingDetail,
  type RescheduledBooking,
} from "@/services/parishionerBookingService";
import RescheduleBookingModal from "./RescheduleBookingModal";

const label = (value: string) =>
  value.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_PATTERN = /\.(pdf|jpe?g|png)$/i;

function withoutKey<T>(record: Record<string, T>, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}

export default function BookingDetailModal({
  bookingId,
  onClose,
  onRescheduled,
}: {
  bookingId: number | null;
  onClose: () => void;
  onRescheduled?: () => Promise<void> | void;
}) {
  const [result, setResult] = useState<{
    bookingId: number;
    booking: ParishionerBookingDetail | null;
    error: string;
  }>({ bookingId: 0, booking: null, error: "" });
  const [rescheduling, setRescheduling] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [selectedTypes, setSelectedTypes] = useState<Record<string, string>>({});
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const booking = result.bookingId === bookingId ? result.booking : null;
  const error = result.bookingId === bookingId ? result.error : "";

  useEffect(() => {
    if (!bookingId) return;
    getParishionerBooking(bookingId)
      .then((booking) => {
        setResult({ bookingId, booking, error: "" });
        setPaymentReference(booking.payment.referenceNumber ?? "");
        setPaymentReceipt(null);
        setPaymentErrors({});
      })
      .catch(() =>
        setResult({
          bookingId,
          booking: null,
          error: "Unable to load this booking's information.",
        }),
      );
  }, [bookingId]);

  if (!bookingId) return null;

  const applyReschedule = (updated: RescheduledBooking) => {
    setResult((current) => ({
      ...current,
      booking: current.booking
        ? {
            ...current.booking,
            status: updated.status,
            bookingSlotId: updated.bookingSlotId,
            schedule: updated.schedule,
          }
        : null,
    }));
    void onRescheduled?.();
  };

  const closeDetail = () => {
    setRescheduling(false);
    setPendingFiles({});
    setUploadErrors({});
    setSelectedTypes({});
    setPaymentReference("");
    setPaymentReceipt(null);
    setPaymentErrors({});
    onClose();
  };

  const selectPaymentReceipt = (file: File) => {
    if (!ALLOWED_FILE_PATTERN.test(file.name)) {
      setPaymentReceipt(null);
      setPaymentErrors((current) => ({ ...current, receipt: "Select a PDF, JPG, JPEG, or PNG file." }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setPaymentReceipt(null);
      setPaymentErrors((current) => ({ ...current, receipt: "The selected receipt must not exceed 5 MB." }));
      return;
    }

    setPaymentReceipt(file);
    setPaymentErrors((current) => withoutKey(current, "receipt"));
  };

  const submitPayment = async () => {
    const errors: Record<string, string> = {};
    if (!paymentReference.trim()) errors.reference_number = "Enter the GCash reference number.";
    if (!paymentReceipt) errors.receipt = "Choose the GCash receipt before submitting.";
    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0 || !paymentReceipt) return;

    setSubmittingPayment(true);
    try {
      await submitParishionerBookingPayment(bookingId, paymentReference.trim(), paymentReceipt);
      const refreshed = await getParishionerBooking(bookingId);
      setResult({ bookingId, booking: refreshed, error: "" });
      setPaymentReference(refreshed.payment.referenceNumber ?? "");
      setPaymentReceipt(null);
      setPaymentErrors({});
      void onRescheduled?.();
    } catch (requestError) {
      if (requestError instanceof AxiosError && requestError.response?.status === 422) {
        const serverErrors = requestError.response.data?.errors as Record<string, string[]> | undefined;
        setPaymentErrors({
          reference_number: serverErrors?.reference_number?.[0] ?? "",
          receipt: serverErrors?.receipt?.[0] ?? "",
        });
      } else {
        setPaymentErrors({ receipt: "Unable to submit the payment. Please try again." });
      }
    } finally {
      setSubmittingPayment(false);
    }
  };

  const selectRequirementFile = (
    requirement: ParishionerBookingDetail["missingRequirements"][number],
    file: File,
  ) => {
    if (!ALLOWED_FILE_PATTERN.test(file.name)) {
      setPendingFiles((current) => withoutKey(current, requirement.key));
      setUploadErrors((current) => ({
        ...current,
        [requirement.key]: "Select a PDF, JPG, JPEG, or PNG file.",
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setPendingFiles((current) => withoutKey(current, requirement.key));
      setUploadErrors((current) => ({
        ...current,
        [requirement.key]: "The selected file must not exceed 5 MB.",
      }));
      return;
    }

    setPendingFiles((current) => ({ ...current, [requirement.key]: file }));
    setUploadErrors((current) => withoutKey(current, requirement.key));
  };

  const uploadRequirement = async (
    requirement: ParishionerBookingDetail["missingRequirements"][number],
  ) => {
    const file = pendingFiles[requirement.key];
    if (!file) {
      setUploadErrors((current) => ({
        ...current,
        [requirement.key]: "Choose a file before submitting this requirement.",
      }));
      return;
    }

    const documentType = selectedTypes[requirement.key] ?? requirement.types[0];
    setUploading(requirement.key);
    setUploadErrors((current) => withoutKey(current, requirement.key));

    try {
      const uploaded = await uploadParishionerBookingDocument(
        bookingId,
        documentType,
        file,
      );
      setResult((current) => ({
        ...current,
        booking: current.booking
          ? {
              ...current.booking,
              documents: [...current.booking.documents, uploaded.document],
              missingRequirements: uploaded.missingRequirements,
            }
          : null,
      }));
      setPendingFiles((current) => withoutKey(current, requirement.key));
      setSelectedTypes((current) => withoutKey(current, requirement.key));
      void onRescheduled?.();
    } catch {
      setUploadErrors((current) => ({
        ...current,
        [requirement.key]: "Unable to submit this requirement. Please try again.",
      }));
    } finally {
      setUploading(null);
    }
  };

  return (
    <div data-app-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={closeDetail}>
      <div data-modal-scroll="true" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B22222]">Booking information</p>
            <h2 className="mt-1 font-serif text-2xl font-bold">{booking?.service ?? "Loading booking..."}</h2>
            {booking && <p className="mt-1 text-sm text-gray-500">{booking.reference}</p>}
          </div>
          <button onClick={closeDetail} aria-label="Close" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
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

            {booking.canReschedule && (
              <section className="flex flex-col gap-4 rounded-2xl border border-[#E7E2DA] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-[#B22222]"><CalendarClock size={21} /></div>
                  <div>
                    <h3 className="font-semibold text-[#292524]">Need a different schedule?</h3>
                    <p className="mt-1 text-sm leading-5 text-gray-500">Select another available date and time for this {booking.service.toLowerCase()} booking.</p>
                  </div>
                </div>
                <button type="button" onClick={() => setRescheduling(true)} className="shrink-0 rounded-xl bg-[#B22222] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#991B1B]">Reschedule</button>
              </section>
            )}

            {booking.package && (
              <section className="rounded-2xl border p-5">
                <h3 className="font-semibold">Package and payment</h3>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p><span className="text-gray-500">Package:</span> {booking.package.name}</p><p><span className="text-gray-500">Total:</span> ₱{booking.package.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
                {booking.package.inclusions.length > 0 && <p className="mt-2 text-sm"><span className="text-gray-500">Inclusions:</span> {booking.package.inclusions.join(", ")}</p>}
                {booking.package.addons.length > 0 && <p className="mt-2 text-sm"><span className="text-gray-500">Add-ons:</span> {booking.package.addons.map((addon) => addon.name).join(", ")}</p>}
              </section>
            )}

            {booking.payment.required && (
              <section className="rounded-2xl border border-[#E7E2DA] p-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-[#B22222]"><CreditCard size={21} /></div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#292524]">GCash payment</h3>
                    <p className="mt-1 text-sm leading-5 text-gray-500">Amount due: <span className="font-semibold text-[#B22222]">₱{booking.payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-[#FAF8F5] p-4 text-sm">
                  <p className="font-semibold text-[#292524]">St. Lorenzo Ruiz Parish</p>
                  <p className="mt-1 text-gray-500">GCash: 09945697318</p>
                  <p className="mt-2 text-xs font-medium text-gray-500">Payment status: <span className="text-[#B22222]">{label(booking.payment.status)}</span></p>
                  {booking.payment.referenceNumber && <p className="mt-1 break-all text-xs text-gray-500">Reference: {booking.payment.referenceNumber}</p>}
                  {booking.payment.receipt && <a href={booking.payment.receipt.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#B22222] hover:underline">View submitted receipt <ExternalLink size={13} /></a>}
                </div>

                {booking.payment.status === "pending" && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-800">Your payment is awaiting parish staff verification. The booking will be marked as paid after confirmation.</p>}
                {booking.payment.status === "confirmed" && <p className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm leading-5 text-green-800">Your payment has been confirmed by the parish staff.</p>}
                {booking.payment.status === "rejected" && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700">The previous payment could not be verified. Submit a corrected reference number and receipt below.</p>}

                {booking.payment.canSubmit && (
                  <div className="mt-4 space-y-4 border-t border-[#E7E2DA] pt-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#292524]">GCash reference number <span className="text-red-600">*</span></label>
                      <input value={paymentReference} onChange={(event) => { setPaymentReference(event.target.value); setPaymentErrors((current) => withoutKey(current, "reference_number")); }} placeholder="Enter the reference number" className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#B22222] ${paymentErrors.reference_number ? "border-red-400" : "border-gray-300"}`} />
                      {paymentErrors.reference_number && <p className="mt-1 text-sm text-red-600">{paymentErrors.reference_number}</p>}
                    </div>

                    <div>
                      <label className="inline-flex max-w-full cursor-pointer items-center gap-2 rounded-xl border border-[#B22222] px-4 py-2.5 text-sm font-semibold text-[#B22222] transition hover:bg-red-50">
                        <FileUp size={16} /> {paymentReceipt ? "Replace receipt" : "Choose receipt"}
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" disabled={submittingPayment} onChange={(event) => { const file = event.target.files?.[0]; if (file) selectPaymentReceipt(file); event.target.value = ""; }} />
                      </label>
                      {paymentReceipt && <p className="mt-2 break-all text-sm font-medium text-green-700">{paymentReceipt.name} · {(paymentReceipt.size / 1024 / 1024).toFixed(2)} MB</p>}
                      {paymentErrors.receipt && <p className="mt-1 text-sm text-red-600">{paymentErrors.receipt}</p>}
                    </div>

                    <button type="button" disabled={submittingPayment} onClick={() => void submitPayment()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B22222] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                      {submittingPayment ? <LoaderCircle className="animate-spin" size={17} /> : <CreditCard size={17} />}
                      {submittingPayment ? "Submitting payment..." : "Submit payment for verification"}
                    </button>
                  </div>
                )}
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

            {booking.missingRequirements.length > 0 && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <FileUp className="mt-0.5 shrink-0 text-amber-700" size={21} />
                  <div>
                    <h3 className="font-semibold text-amber-900">Requirements to follow</h3>
                    <p className="mt-1 text-sm leading-5 text-amber-800">Your booking remains pending until these documents are submitted. Choosing a file will not upload it immediately; review the file first, then select Submit requirement.</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {booking.missingRequirements.map((requirement) => {
                    const pendingFile = pendingFiles[requirement.key];
                    const isUploading = uploading === requirement.key;

                    return (
                    <div key={requirement.key} className="rounded-xl border border-amber-200 bg-white p-4">
                      <p className="text-sm font-semibold text-gray-800">{requirement.label}</p>
                      {requirement.types.length > 1 && (
                        <select
                          value={selectedTypes[requirement.key] ?? requirement.types[0]}
                          onChange={(event) => setSelectedTypes((current) => ({ ...current, [requirement.key]: event.target.value }))}
                          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#B22222]"
                        >
                          {requirement.types.map((type) => <option key={type} value={type}>{label(type)}</option>)}
                        </select>
                      )}
                      {booking.canUploadDocuments && (
                        <div className="mt-3 space-y-3">
                          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#B22222] px-4 py-2 text-sm font-semibold text-[#B22222] transition hover:bg-red-50 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                            <FileUp size={16} />
                            {pendingFile ? "Replace selected file" : "Choose file"}
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              disabled={uploading !== null}
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) selectRequirementFile(requirement, file);
                                event.target.value = "";
                              }}
                            />
                          </label>

                          {pendingFile && (
                            <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 shrink-0 text-green-700" size={20} />
                                <div className="min-w-0 flex-1">
                                  <p className="break-all text-sm font-semibold text-green-900">{pendingFile.name}</p>
                                  <p className="mt-0.5 text-xs text-green-700">{(pendingFile.size / 1024 / 1024).toFixed(2)} MB · Ready for submission</p>
                                </div>
                                <button
                                  type="button"
                                  aria-label={`Remove ${pendingFile.name}`}
                                  disabled={isUploading}
                                  onClick={() => setPendingFiles((current) => withoutKey(current, requirement.key))}
                                  className="rounded-lg p-1.5 text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>

                              <button
                                type="button"
                                disabled={uploading !== null}
                                onClick={() => void uploadRequirement(requirement)}
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B22222] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                              >
                                {isUploading ? <LoaderCircle className="animate-spin" size={16} /> : <FileUp size={16} />}
                                {isUploading ? "Submitting..." : "Submit requirement"}
                              </button>
                            </div>
                          )}

                          {uploadErrors[requirement.key] && (
                            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                              {uploadErrors[requirement.key]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </section>
            )}

            {booking.remarks && <section className="rounded-2xl border p-5"><h3 className="font-semibold">Remarks</h3><p className="mt-2 text-sm text-gray-600">{booking.remarks}</p></section>}
          </div>
        )}
      </div>

      {booking && rescheduling && (
        <RescheduleBookingModal
          booking={booking}
          onClose={() => setRescheduling(false)}
          onRescheduled={applyReschedule}
        />
      )}
    </div>
  );
}
