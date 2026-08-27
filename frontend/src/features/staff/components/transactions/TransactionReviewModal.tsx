import {
  ArrowUpRight,
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

interface Props {
  transaction: StaffTransaction | null;
  processing: boolean;
  onClose: () => void;
  onConfirm: (transaction: StaffTransaction) => void;
  onReject: (transaction: StaffTransaction) => void;
}

const isImage = (fileName: string) => /\.(jpe?g|png|webp|gif)$/i.test(fileName);

const money = (amount: number) =>
  amount.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });

export default function TransactionReviewModal({
  transaction,
  processing,
  onClose,
  onConfirm,
  onReject,
}: Props) {
  if (!transaction) return null;

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
                  <p className="mt-1 text-xs text-white/45">
                    Open the attached PDF to verify its contents.
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
                    Compare these with the receipt.
                  </p>
                </div>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-gray-400">
                    GCash reference number
                  </dt>
                  <dd className="mt-1 break-all font-bold text-[#292524]">
                    {transaction.reference || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Expected amount</dt>
                  <dd className="mt-1 text-lg font-bold text-[#B22222]">
                    {money(transaction.amount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Service</dt>
                  <dd className="mt-1 font-semibold text-[#292524]">
                    {transaction.type}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Submitted</dt>
                  <dd className="mt-1 font-medium text-[#292524]">
                    {transaction.date}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Contact number</dt>
                  <dd className="mt-1 font-medium text-[#292524]">
                    {transaction.contactNumber}
                  </dd>
                </div>
              </dl>
            </section>

            {transaction.status === "pending" ? (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs leading-5 text-amber-900">
                  Confirm only when the receipt amount and GCash reference match
                  the submitted payment details.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        disabled={processing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 size={17} /> Confirm payment
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirm this payment?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will mark the payment and its related booking as
                          paid and notify the parishioner by SMS.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Review again</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onConfirm(transaction)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Confirm payment
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <RejectConfirmationButton
                    label="Reject payment"
                    itemLabel="payment"
                    onConfirm={() => onReject(transaction)}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  />
                </div>
                {processing && (
                  <p className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-amber-800">
                    <LoaderCircle size={14} className="animate-spin" /> Updating
                    payment...
                  </p>
                )}
              </section>
            ) : (
              <div
                className={`rounded-2xl border p-4 text-sm font-semibold ${transaction.status === "confirmed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}
              >
                This payment has been {transaction.status}.
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
