import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  FileText,
  FilterX,
  LoaderCircle,
  Search,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

import { Skeleton, TableSkeletonRows } from "@/components/ui/skeleton";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import RequestStatusBadge from "../components/requests/RequestStatusBadge";
import RequestDetailModal from "../components/requests/RequestDetailModal";
import type { RequestStatus, ServiceRequest } from "../types/request";
import {
  getAllStaffDocumentRequests,
  getStaffDocumentRequests,
  updateDocumentRequestStatus,
  type StaffDocumentRequestFilters,
  type StaffDocumentRequestPage,
} from "@/services/staffManagementService";
import { formatLabel } from "../utils/formatLabel";
import { requestStatusLabel } from "../utils/requestStatus";
import {
  drawParishPdfLetterhead,
  loadParishPdfLogo,
} from "../utils/pdfLetterhead";
import { formatMoneyAmount, formatPhpCurrency } from "@/utils/currency";

const statusOptions: Array<{ label: string; value: RequestStatus | "" }> = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Preparing", value: "paid" },
  { label: "Approved", value: "approved" },
  { label: "Ready for Pickup", value: "ready_for_pickup" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const emptyMeta: StaffDocumentRequestPage["meta"] = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

const requestMessage = (error: unknown, fallback: string) => {
  if (!(error instanceof AxiosError)) return fallback;
  const message = error.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

export default function Requests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [meta, setMeta] = useState<StaffDocumentRequestPage["meta"]>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState<RequestStatus | "">("");
  const [requestDate, setRequestDate] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    getStaffDocumentRequests(
      {
        status: status || undefined,
        date: requestDate || undefined,
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
        setRequests(result.data);
        setMeta(result.meta);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          toast.error("Unable to load document requests.");
          setRequests([]);
          setMeta(emptyMeta);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [status, requestDate, debouncedSearch, page, reloadKey]);

  const currentFilters = (): Omit<
    StaffDocumentRequestFilters,
    "page" | "perPage"
  > => ({
    status: status || undefined,
    date: requestDate || undefined,
    search: debouncedSearch || undefined,
  });

  const clearFilters = () => {
    setLoading(true);
    setSearch("");
    setDebouncedSearch("");
    setStatus("");
    setRequestDate("");
    setPage(1);
  };

  const updateStatus = async (id: number, nextStatus: RequestStatus) => {
    try {
      const updated = await updateDocumentRequestStatus(id, nextStatus);
      toast.success(
        `Request from “${updated.name}” is now ${requestStatusLabel(nextStatus)}.`,
      );
      setSelected(null);
      setLoading(true);
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error(
        requestMessage(error, "Unable to update the document request status."),
      );
    }
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const records = await getAllStaffDocumentRequests(currentFilters());
      if (records.length === 0) {
        toast.error(
          "There are no document requests to export for the active filters.",
        );
        return;
      }

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const generatedAt = new Date().toLocaleString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      const filterSummary = [
        status ? `${requestStatusLabel(status)} status` : "All statuses",
        requestDate ? `Submitted: ${requestDate}` : "All submission dates",
        debouncedSearch ? `Search: ${debouncedSearch}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const logo = await loadParishPdfLogo();
      drawParishPdfLetterhead(doc, logo);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(178, 34, 34);
      doc.text("Document Request Report", 14, 29);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(filterSummary, 14, 35);
      doc.text(
        `Generated ${generatedAt} | ${records.length} record${records.length === 1 ? "" : "s"}`,
        14,
        40,
      );

      autoTable(doc, {
        startY: 45,
        margin: { left: 14, right: 14, bottom: 14 },
        head: [
          [
            "Reference",
            "Submitted",
            "Parishioner",
            "Contact number",
            "Requested document/s",
            "Amount",
            "Status",
          ],
        ],
        body: records.map((item) => [
          item.reference,
          item.date,
          item.name,
          item.contactNumber,
          item.documents
            .map((document) => formatLabel(document.type))
            .join(", "),
          `PHP ${formatMoneyAmount(item.amount)}`,
          requestStatusLabel(item.status),
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [178, 34, 34],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          cellPadding: 3.2,
        },
        bodyStyles: {
          textColor: [55, 55, 55],
          cellPadding: 3,
          valign: "middle",
        },
        styles: { fontSize: 8.2, lineColor: [231, 226, 218], lineWidth: 0.15 },
        alternateRowStyles: { fillColor: [250, 248, 245] },
        columnStyles: {
          0: { cellWidth: 33, fontStyle: "bold" },
          1: { cellWidth: 27 },
          3: { cellWidth: 33 },
          5: { cellWidth: 28, halign: "right" },
          6: { cellWidth: 28 },
        },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.setTextColor(130, 130, 130);
          doc.text(
            `Page ${data.pageNumber}`,
            doc.internal.pageSize.getWidth() - 14,
            doc.internal.pageSize.getHeight() - 7,
            { align: "right" },
          );
        },
      });

      doc.save(
        `document-requests-${new Date().toISOString().slice(0, 10)}.pdf`,
      );
      toast.success(
        `${records.length} document request records exported to PDF.`,
      );
    } catch (error) {
      toast.error(
        requestMessage(error, "Unable to export the document request report."),
      );
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = Boolean(search || status || requestDate);

  return (
    <StaffDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#B22222] px-6 py-7 text-white shadow-lg sm:px-9 sm:py-9">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/6"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 right-32 size-40 rounded-full border-24 border-white/4"
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/10">
                <FileText size={23} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                  Parish records
                </p>
                <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                  Document Requests
                </h1>
                <p className="mt-1 text-sm text-white/75">
                  Review requested documents, payments, processing, and release
                  status.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                Matching records
              </p>
              {loading && meta.total === 0 ? (
                <Skeleton className="mt-1 h-7 w-12 bg-white/20" />
              ) : (
                <p className="mt-0.5 text-2xl font-bold tabular-nums">
                  {meta.total}
                </p>
              )}
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-[#E7E2DA] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_200px_180px_auto_auto]">
            <label className="relative block">
              <span className="sr-only">Search document requests</span>
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setLoading(true);
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search reference, name, contact, or document..."
                className="h-11 w-full rounded-xl border border-[#E7E2DA] pl-11 pr-4 text-sm outline-none transition focus:border-[#B22222] focus:ring-3 focus:ring-[#B22222]/8"
              />
            </label>
            <label>
              <span className="sr-only">Filter by status</span>
              <select
                value={status}
                onChange={(event) => {
                  setLoading(true);
                  setStatus(event.target.value as RequestStatus | "");
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-[#E7E2DA] bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#B22222]"
              >
                {statusOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="relative block">
              <span className="sr-only">Filter by submission date</span>
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={requestDate}
                onChange={(event) => {
                  setLoading(true);
                  setRequestDate(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-[#E7E2DA] bg-white pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-[#B22222]"
              />
            </label>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E7E2DA] px-4 text-sm font-semibold text-gray-600 transition hover:border-[#B22222]/30 hover:bg-red-50 hover:text-[#B22222] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FilterX size={16} /> Clear
            </button>
            <button
              type="button"
              onClick={() => void exportPdf()}
              disabled={exporting || loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#B22222] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporting ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <FileDown size={17} />
              )}
              {exporting ? "Preparing..." : "Export PDF"}
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-[#EFEAE3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#292524]">
                Submitted document requests
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                A request may contain one or multiple parish documents.
              </p>
            </div>
            {loading && <Skeleton className="mt-2 h-3 w-24 sm:mt-0" />}
          </div>
          <p className="border-b border-[#EFEAE3] px-5 py-2 text-[11px] text-gray-400 xl:hidden">
            Swipe or scroll sideways to view the remaining request details.
          </p>
          <div
            data-table-scroll="true"
            className="overflow-x-auto overscroll-x-contain"
          >
            <table className="w-full min-w-190 text-left text-sm">
              <thead>
                <tr className="bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                  <th className="sticky left-0 z-20 bg-[#FAF8F5] px-5 py-4 shadow-[8px_0_14px_-14px_rgba(41,37,36,0.75)] sm:px-6">
                    Reference
                  </th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4">Parishioner</th>
                  <th className="px-5 py-4">Requested document/s</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="sticky right-0 z-20 border-l border-[#EFEAE3] bg-[#FAF8F5] px-5 py-4 text-right shadow-[-8px_0_14px_-14px_rgba(41,37,36,0.75)] sm:px-6">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeletonRows columns={7} />
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <FileText className="mx-auto text-gray-300" size={34} />
                      <p className="mt-3 font-medium text-gray-600">
                        No document requests found
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        Try changing or clearing the active filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  requests.map((item) => (
                    <tr
                      key={item.id}
                      className="group border-t border-[#F0EDE7] bg-white transition-colors hover:bg-[#FCFAF7]"
                    >
                      <td className="sticky left-0 z-10 bg-white px-5 py-4 shadow-[8px_0_14px_-14px_rgba(41,37,36,0.65)] transition-colors group-hover:bg-[#FCFAF7] sm:px-6">
                        <span className="font-semibold text-[#292524]">
                          {item.reference}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-gray-400">
                          Request #{item.id}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 tabular-nums text-gray-600">
                        {item.date}
                      </td>
                      <td className="max-w-56 px-5 py-4">
                        <p
                          className="truncate font-semibold text-[#292524]"
                          title={item.name}
                        >
                          {item.name}
                        </p>
                        <p className="mt-0.5 whitespace-nowrap text-xs text-gray-400">
                          {item.contactNumber}
                        </p>
                      </td>
                      <td className="max-w-72 px-5 py-4">
                        <p
                          className="line-clamp-2 text-gray-600"
                          title={item.subtype}
                        >
                          {item.documents
                            .map((document) => formatLabel(document.type))
                            .join(", ")}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          {item.documents.length} item
                          {item.documents.length === 1 ? "" : "s"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums text-[#292524]">
                        {formatPhpCurrency(item.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <RequestStatusBadge status={item.status} />
                      </td>
                      <td className="sticky right-0 z-10 border-l border-[#EFEAE3] bg-white px-5 py-4 text-right shadow-[-8px_0_14px_-14px_rgba(41,37,36,0.65)] transition-colors group-hover:bg-[#FCFAF7] sm:px-6">
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E2DA] px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-[#B22222]/35 hover:bg-red-50 hover:text-[#B22222]"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {meta.total > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#F0EDE7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {meta.from}–{meta.to}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {meta.total}
                </span>{" "}
                matching records
              </p>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setPage((current) => Math.max(1, current - 1));
                  }}
                  disabled={page === 1 || loading}
                  className="grid size-9 place-items-center rounded-lg border border-[#E7E2DA] text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} />
                </button>
                <span className="min-w-24 text-center text-sm tabular-nums text-gray-500">
                  Page{" "}
                  <strong className="text-gray-700">{meta.current_page}</strong>{" "}
                  of {meta.last_page}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setPage((current) => Math.min(meta.last_page, current + 1));
                  }}
                  disabled={page === meta.last_page || loading}
                  className="grid size-9 place-items-center rounded-lg border border-[#E7E2DA] text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <RequestDetailModal
        request={selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={updateStatus}
      />
    </StaffDashboardLayout>
  );
}
