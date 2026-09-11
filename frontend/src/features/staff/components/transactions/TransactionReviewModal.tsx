import { useState } from "react";
import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  FileImage,
  FileText,
  LoaderCircle,
  ShieldCheck,
  X,
} from "lucide-react";

import type { StaffTransaction } from "@/services/staffTransactionService";
import RejectConfirmationButton from "../RejectConfirmationButton";
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

interface CashConfirmation {
  amount_received: number;
  official_receipt_number: string;
  notes?: string;
}

interface Props {
  transaction: StaffTransaction | null;
  processing: boolean;
  onClose: () => void;
  onConfirm: (
    transaction: StaffTransaction,
    cashDetails?: CashConfirmation,
  ) => void;
  onReject: (transaction: StaffTransaction) => void;
}

const isImage = (fileName: string) => /\.(jpe?g|png|webp|gif)$/i.test(fileName);

export default function TransactionReviewModal({
  transaction,
  processing,
  onClose,
  onConfirm,
  onReject,
}: Props) {
  const [officialReceiptNumber, setOfficialReceiptNumber] = useState(
    transaction?.officialReceiptNumber ?? "",
  );
  const [amountReceived, setAmountReceived] = useState(
    transaction ? String(transaction.amount) : "",
  );
  const [notes, setNotes] = useState(transaction?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!transaction) return null;

  const confirmCash = () => {
    const nextErrors: Record<string, string> = {};
    if (!officialReceiptNumber.trim()) {
      nextErrors.official_receipt_number =
        "Official receipt number is required.";
    }
    if (!amountReceived || Number(amountReceived) !== transaction.amount) {
      nextErrors.amount_received = `Enter the exact amount due: ${formatPhpCurrency(transaction.amount)}.`;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onConfirm(transaction, {
      amount_received: Number(amountReceived),
      official_receipt_number: officialReceiptNumber.trim(),
      notes: notes.trim() || undefined,
    });
  };

  const isPending = ["awaiting_payment", "pending_verification"].includes(
    transaction.status,
  );

  return (
    <div
      data-app-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-2 backdrop-blur-sm sm:p-4"
    >
      <section
        data-modal-scroll="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-review-title"
        className="max-h-[95vh] w-full max-w-3xl overflow-x-hidden overflow-y-auto rounded-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl"
      >
        <header className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-[#EEE8E0] bg-white/95 px-5 py-4 backdrop-blur sm:px-7 sm:py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B22222]">
              Payment verification
            </p>
            <h2
              id="payment-review-title"
              className="mt-1 truncate font-serif text-xl font-bold text-[#292524] sm:text-2xl"
            >
              {transaction.name}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {transaction.bookingReference}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            aria-label="Close payment review"
            className="grid size-9 shrink-0 place-items-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </header>

        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
          {transaction.receipt ? (
            <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E7E2DA] bg-[#211A18]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white">
                <div className="flex min-w-0 items-center gap-2">
                  <FileImage size={16} className="shrink-0 text-[#F5D76E]" />
                  <span className="truncate text-xs font-semibold">
                    {transaction.receipt.fileName}
                  </span>
                </div>
                <a
                  href={transaction.receipt.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-3 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-white/75 transition hover:text-white"
                >
                  Open <ArrowUpRight size={13} />
                </a>
              </div>
              <div className="flex min-h-72 items-center justify-center bg-[#2A2320] p-3 sm:min-h-96">
                {isImage(transaction.receipt.fileName) ? (
                  <img
                    src={transaction.receipt.url}
                    alt={`GCash receipt submitted by ${transaction.name}`}
                    className="max-h-[32rem] w-full object-contain"
                  />
                ) : (
                  <div className="px-6 py-16 text-center text-white/65">
                    <FileText className="mx-auto" size={42} />
                    <p className="mt-3 text-sm font-semibold">
                      Preview is available in a new tab
                    </p>
                    <a
                      href={transaction.receipt.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#292524] transition hover:bg-[#F5D76E]"
                    >
                      View attached receipt <ArrowUpRight size={14} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-80 min-w-0 flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-white text-[#B22222] shadow-sm">
                <Banknote size={28} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#292524]">
                Cash at Parish Office
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600">
                Confirm only after receiving the cash and issuing an official
                parish receipt.
              </p>
            </div>
          )}

          <aside className="min-w-0 space-y-4">
            <section className="rounded-2xl border border-[#E7E2DA] p-5">
              <div className="flex items-center gap-3 border-b border-[#EFEAE3] pb-4">
                <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-[#B22222]">
                  <ShieldCheck size={19} />
                </span>
                <div>
                  <h3 className="font-semibold text-[#292524]">
                    Payment details
                  </h3>
                  <p className="text-xs text-gray-500">
                    {transaction.method === "gcash"
                      ? "Compare these with the receipt."
                      : "Record the official cash receipt."}
                  </p>
                </div>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <Detail label="Payment method" value={transaction.method} />
                {transaction.method === "gcash" && (
                  <Detail
                    label="GCash reference number"
                    value={transaction.reference || "Not provided"}
                  />
                )}
                {transaction.officialReceiptNumber && (
                  <Detail
                    label="Official receipt number"
                    value={transaction.officialReceiptNumber}
                  />
                )}
                <Detail
                  label="Expected amount"
                  value={formatPhpCurrency(transaction.amount)}
                  prominent
                />
                <Detail label="Service" value={transaction.type} />
                <Detail label="Submitted" value={transaction.date} />
                <Detail
                  label="Contact number"
                  value={transaction.contactNumber}
                />
              </dl>
            </section>

            {transaction.status === "awaiting_payment" && (
              <CashConfirmationForm
                amountReceived={amountReceived}
                officialReceiptNumber={officialReceiptNumber}
                notes={notes}
                errors={errors}
                processing={processing}
                onAmountChange={(value) => {
                  setAmountReceived(value);
                  setErrors((current) => ({
                    ...current,
                    amount_received: "",
                  }));
                }}
                onReceiptChange={(value) => {
                  setOfficialReceiptNumber(value);
                  setErrors((current) => ({
                    ...current,
                    official_receipt_number: "",
                  }));
                }}
                onNotesChange={setNotes}
                onConfirm={confirmCash}
              />
            )}

            {transaction.status === "pending_verification" && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs leading-5 text-amber-900">
                  Confirm only when the receipt amount and GCash reference match
                  the submitted payment details.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <ConfirmDialog
                    processing={processing}
                    title="Confirm this GCash payment?"
                    action="Confirm payment"
                    onConfirm={() => onConfirm(transaction)}
                  />
                  <RejectConfirmationButton
                    label="Reject payment"
                    itemLabel="payment"
                    onConfirm={() => onReject(transaction)}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  />
                </div>
              </section>
            )}

            {processing && isPending && (
              <p className="flex items-center justify-center gap-2 text-xs font-medium text-amber-800">
                <LoaderCircle size={14} className="animate-spin" /> Updating
                payment...
              </p>
            )}

            {!isPending && (
              <div
                className={`rounded-2xl border p-4 text-sm font-semibold ${
                  transaction.status === "confirmed"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-700"
                }`}
              >
                This payment is {transaction.status.replace("_", " ")}.
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

function Detail({
  label,
  value,
  prominent = false,
}: {
  label: string;
  value: string;
  prominent?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd
        className={`mt-1 break-all font-semibold capitalize ${
          prominent ? "text-lg text-[#B22222]" : "text-[#292524]"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function CashConfirmationForm({
  amountReceived,
  officialReceiptNumber,
  notes,
  errors,
  processing,
  onAmountChange,
  onReceiptChange,
  onNotesChange,
  onConfirm,
}: {
  amountReceived: string;
  officialReceiptNumber: string;
  notes: string;
  errors: Record<string, string>;
  processing: boolean;
  onAmountChange: (value: string) => void;
  onReceiptChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onConfirm: () => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <Field label="Amount received" error={errors.amount_received}>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amountReceived}
          onChange={(event) => onAmountChange(event.target.value)}
          className="mt-1.5 h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm outline-none focus:border-[#B22222]"
        />
      </Field>
      <Field
        label="Official receipt number"
        error={errors.official_receipt_number}
      >
        <input
          value={officialReceiptNumber}
          onChange={(event) => onReceiptChange(event.target.value)}
          placeholder="Example: OR-2026-00125"
          className="mt-1.5 h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm outline-none focus:border-[#B22222]"
        />
      </Field>
      <label className="block text-xs font-semibold text-gray-700">
        Notes <span className="font-normal text-gray-400">(optional)</span>
        <textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          rows={3}
          className="mt-1.5 w-full resize-none rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#B22222]"
        />
      </label>
      <ConfirmDialog
        processing={processing}
        title="Confirm cash received?"
        action="Confirm cash payment"
        onConfirm={onConfirm}
      />
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-semibold text-gray-700">
      {label}
      {children}
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}

function ConfirmDialog({
  processing,
  title,
  action,
  onConfirm,
}: {
  processing: boolean;
  title: string;
  action: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={processing}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <CheckCircle2 size={17} /> {action}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            This marks the related booking as paid and sends an SMS confirmation
            to the parishioner.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Review again</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
