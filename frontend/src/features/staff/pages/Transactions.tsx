import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileImage,
  FilterX,
  LoaderCircle,
  Receipt,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import {
  getStaffTransactions,
  updateTransactionStatus,
  type StaffTransaction,
  type StaffTransactionPage,
  type TransactionService,
  type TransactionStatus,
} from "@/services/staffTransactionService";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import TransactionReviewModal from "../components/transactions/TransactionReviewModal";

const statusStyles: Record<TransactionStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

const statusDotStyles: Record<TransactionStatus, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-emerald-500",
  rejected: "bg-red-500",
};

const serviceOptions: Array<{ label: string; value: TransactionService | "" }> = [
  { label: "All services", value: "" },
  { label: "Mass Intention", value: "mass-intention" },
  { label: "Document Request", value: "document-request" },
  { label: "Baptism", value: "baptism" },
  { label: "Wedding", value: "wedding" },
  { label: "Funeral", value: "funeral" },
];

const emptyMeta: StaffTransactionPage["meta"] = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}>
      <span className={`size-1.5 rounded-full ${statusDotStyles[status]}`} />
      {status}
    </span>
  );
}

const money = (amount: number) =>
  amount.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });

const requestMessage = (error: unknown, fallback: string) => {
  if (!(error instanceof AxiosError)) return fallback;
  const message = error.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

export default function Transactions() {
  const [items, setItems] = useState<StaffTransaction[]>([]);
  const [meta, setMeta] = useState<StaffTransactionPage["meta"]>(emptyMeta);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<TransactionStatus | "">("pending");
  const [service, setService] = useState<TransactionService | "">("");
  const [submittedDate, setSubmittedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<StaffTransaction | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    getStaffTransactions(
      {
        status: status || undefined,
        service: service || undefined,
        date: submittedDate || undefined,
        search: debouncedSearch || undefined,
        page,
        perPage: 10,
      },
      controller.signal,
    )
      .then((result) => {
        if (result.meta.last_page < page) {
          setPage(result.meta.last_page);
          return;
        }
        setItems(result.data);
        setMeta(result.meta);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          toast.error("Unable to load transactions.");
          setItems([]);
          setMeta(emptyMeta);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [status, service, submittedDate, debouncedSearch, page, reloadKey]);

  const clearFilters = () => {
    setLoading(true);
    setSearch("");
    setDebouncedSearch("");
    setStatus("");
    setService("");
    setSubmittedDate("");
    setPage(1);
  };

  const changeStatus = async (
    item: StaffTransaction,
    nextStatus: "confirmed" | "rejected",
  ) => {
    setProcessing(true);
    try {
      await updateTransactionStatus(item.id, nextStatus);
      toast.success(`Payment ${nextStatus}. The parishioner notification has been queued.`);
      setSelected(null);
      setLoading(true);
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error(requestMessage(error, "Unable to update the payment status."));
    } finally {
      setProcessing(false);
    }
  };

  const hasFilters = Boolean(search || status || service || submittedDate);

  return (
    <StaffDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#B22222] px-6 py-7 text-white shadow-lg sm:px-9 sm:py-9">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/6" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 right-32 size-40 rounded-full border-24 border-white/4" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/10"><Receipt size={23} /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">Payment verification</p>
                <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">Transactions</h1>
                <p className="mt-1 text-sm text-white/75">Compare submitted GCash references and receipts before confirming payment.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Matching payments</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums">{loading && meta.total === 0 ? "—" : meta.total}</p>
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-[#E7E2DA] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(250px,1fr)_180px_190px_180px_auto]">
            <label className="relative block">
              <span className="sr-only">Search transactions</span>
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="search" value={search} onChange={(event) => { setLoading(true); setSearch(event.target.value); setPage(1); }} placeholder="Search reference, name, contact, or receipt..." className="h-11 w-full rounded-xl border border-[#E7E2DA] pl-11 pr-4 text-sm outline-none transition focus:border-[#B22222] focus:ring-3 focus:ring-[#B22222]/8" />
            </label>
            <label><span className="sr-only">Filter by payment status</span><select value={status} onChange={(event) => { setLoading(true); setStatus(event.target.value as TransactionStatus | ""); setPage(1); }} className="h-11 w-full rounded-xl border border-[#E7E2DA] bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#B22222]"><option value="">All statuses</option><option value="pending">Pending review</option><option value="confirmed">Confirmed</option><option value="rejected">Rejected</option></select></label>
            <label><span className="sr-only">Filter by service</span><select value={service} onChange={(event) => { setLoading(true); setService(event.target.value as TransactionService | ""); setPage(1); }} className="h-11 w-full rounded-xl border border-[#E7E2DA] bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#B22222]">{serviceOptions.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}</select></label>
            <label className="relative block"><span className="sr-only">Filter by submission date</span><CalendarDays size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="date" value={submittedDate} onChange={(event) => { setLoading(true); setSubmittedDate(event.target.value); setPage(1); }} className="h-11 w-full rounded-xl border border-[#E7E2DA] bg-white pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-[#B22222]" /></label>
            <button type="button" onClick={clearFilters} disabled={!hasFilters} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E7E2DA] px-4 text-sm font-semibold text-gray-600 transition hover:border-[#B22222]/30 hover:bg-red-50 hover:text-[#B22222] disabled:cursor-not-allowed disabled:opacity-40"><FilterX size={16} /> Clear</button>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-[#EFEAE3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div><h2 className="font-serif text-lg font-bold text-[#292524]">Payment submissions</h2><p className="mt-0.5 text-xs text-gray-500">Pending payments require receipt and reference verification.</p></div>
            {loading && <span className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-gray-400 sm:mt-0"><LoaderCircle size={14} className="animate-spin" /> Updating results</span>}
          </div>
          <p className="border-b border-[#EFEAE3] px-5 py-2 text-[11px] text-gray-400 xl:hidden">Swipe or scroll sideways to view payment details. The review action remains pinned.</p>
          <div data-table-scroll="true" className="overflow-x-auto overscroll-x-contain">
            <table className={`w-full min-w-225 text-left text-sm transition-opacity ${loading && items.length > 0 ? "opacity-55" : "opacity-100"}`}>
              <thead><tr className="bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                <th className="sticky left-0 z-20 bg-[#FAF8F5] px-5 py-4 shadow-[8px_0_14px_-14px_rgba(41,37,36,0.75)] sm:px-6">Booking reference</th><th className="px-5 py-4">Submitted</th><th className="px-5 py-4">Parishioner</th><th className="px-5 py-4">Service</th><th className="px-5 py-4">GCash reference</th><th className="px-5 py-4 text-right">Amount</th><th className="px-5 py-4">Receipt</th><th className="px-5 py-4">Status</th>
                <th className="sticky right-0 z-20 border-l border-[#EFEAE3] bg-[#FAF8F5] px-5 py-4 text-right shadow-[-8px_0_14px_-14px_rgba(41,37,36,0.75)] sm:px-6">Action</th>
              </tr></thead>
              <tbody>
                {loading && items.length === 0 ? (
                  Array.from({ length: 6 }, (_, index) => <tr key={index} className="border-t border-[#F0EDE7]">{Array.from({ length: 9 }, (__, cell) => <td key={cell} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-gray-100" /></td>)}</tr>)
                ) : items.length === 0 ? (
                  <tr><td colSpan={9} className="px-5 py-16 text-center"><Receipt className="mx-auto text-gray-300" size={34} /><p className="mt-3 font-medium text-gray-600">No payment submissions found</p><p className="mt-1 text-sm text-gray-400">Try changing or clearing the active filters.</p></td></tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="group border-t border-[#F0EDE7] bg-white transition-colors hover:bg-[#FCFAF7]">
                    <td className="sticky left-0 z-10 bg-white px-5 py-4 shadow-[8px_0_14px_-14px_rgba(41,37,36,0.65)] transition-colors group-hover:bg-[#FCFAF7] sm:px-6"><span className="font-semibold text-[#292524]">{item.bookingReference}</span><span className="mt-0.5 block text-[11px] text-gray-400">Payment #{item.id}</span></td>
                    <td className="whitespace-nowrap px-5 py-4 tabular-nums text-gray-600">{item.date}</td>
                    <td className="max-w-56 px-5 py-4"><p className="truncate font-semibold text-[#292524]" title={item.name}>{item.name}</p><p className="mt-0.5 whitespace-nowrap text-xs text-gray-400">{item.contactNumber}</p></td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">{item.type}</td>
                    <td className="max-w-44 px-5 py-4"><p className="truncate font-mono text-xs font-semibold text-[#292524]" title={item.reference || "Not provided"}>{item.reference || "Not provided"}</p></td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums text-[#292524]">{money(item.amount)}</td>
                    <td className="px-5 py-4"><a href={item.receipt.url} target="_blank" rel="noreferrer" className="group/receipt inline-flex items-center gap-2 rounded-xl border border-[#E7E2DA] bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-[#B22222]/30 hover:bg-red-50 hover:text-[#B22222]"><FileImage size={15} /> View <ArrowUpRight size={13} className="text-gray-400 group-hover/receipt:text-[#B22222]" /></a></td>
                    <td className="px-5 py-4"><TransactionStatusBadge status={item.status} /></td>
                    <td className="sticky right-0 z-10 border-l border-[#EFEAE3] bg-white px-5 py-4 text-right shadow-[-8px_0_14px_-14px_rgba(41,37,36,0.65)] transition-colors group-hover:bg-[#FCFAF7] sm:px-6"><button type="button" onClick={() => setSelected(item)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${item.status === "pending" ? "bg-[#B22222] text-white hover:bg-[#991B1B]" : "border border-[#E7E2DA] text-gray-600 hover:border-[#B22222]/35 hover:bg-red-50 hover:text-[#B22222]"}`}><Eye size={14} /> {item.status === "pending" ? "Review" : "Details"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta.total > 0 && <div className="flex flex-col gap-3 border-t border-[#F0EDE7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-gray-500">Showing <span className="font-semibold text-gray-700">{meta.from}–{meta.to}</span> of <span className="font-semibold text-gray-700">{meta.total}</span> matching payments</p>
            <div className="flex items-center justify-between gap-2 sm:justify-end"><button type="button" onClick={() => { setLoading(true); setPage((current) => Math.max(1, current - 1)); }} disabled={page === 1 || loading} className="grid size-9 place-items-center rounded-lg border border-[#E7E2DA] text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={17} /></button><span className="min-w-24 text-center text-sm tabular-nums text-gray-500">Page <strong className="text-gray-700">{meta.current_page}</strong> of {meta.last_page}</span><button type="button" onClick={() => { setLoading(true); setPage((current) => Math.min(meta.last_page, current + 1)); }} disabled={page === meta.last_page || loading} className="grid size-9 place-items-center rounded-lg border border-[#E7E2DA] text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page"><ChevronRight size={17} /></button></div>
          </div>}
        </section>
      </div>

      <TransactionReviewModal transaction={selected} processing={processing} onClose={() => { if (!processing) setSelected(null); }} onConfirm={(item) => void changeStatus(item, "confirmed")} onReject={(item) => void changeStatus(item, "rejected")} />
    </StaffDashboardLayout>
  );
}
