import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  FilterX,
  LoaderCircle,
  Search,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

import { Skeleton, TableSkeletonRows } from "@/components/ui/skeleton";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import BookingStatusBadge from "../components/booking/BookingStatusBadge";
import BookingDetailModal from "../components/booking/BookingDetailModal";
import type { Booking, BookingStatus, BookingType } from "../types/booking";
import {
  getAllStaffBookings,
  getStaffBookings,
  updateStaffBookingStatus,
  type StaffBookingFilters,
  type StaffBookingPage,
} from "@/services/staffManagementService";
import {
  drawParishPdfLetterhead,
  loadParishPdfLogo,
} from "../utils/pdfLetterhead";
import { formatMoneyAmount, formatPhpCurrency } from "@/utils/currency";

const bookingTypes: Array<{
  label: BookingType;
  value: NonNullable<StaffBookingFilters["service"]>;
}> = [
  { label: "Marriage", value: "wedding" },
  { label: "Funeral", value: "funeral" },
  { label: "Baptism", value: "baptism" },
];

const statusOptions: Array<{ label: string; value: BookingStatus | "" }> = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Approved", value: "approved" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const emptyMeta = {
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

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<StaffBookingPage["meta"]>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeType, setActiveType] = useState(bookingTypes[0]);
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    getStaffBookings(
      {
        service: activeType.value,
        status: status || undefined,
        date: scheduleDate || undefined,
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

        setBookings(result.data);
        setMeta(result.meta);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          toast.error("Unable to load bookings.");
          setBookings([]);
          setMeta(emptyMeta);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [activeType, status, scheduleDate, debouncedSearch, page, reloadKey]);

  const currentFilters = (): Omit<StaffBookingFilters, "page" | "perPage"> => ({
    service: activeType.value,
    status: status || undefined,
    date: scheduleDate || undefined,
    search: debouncedSearch || undefined,
  });

  const handleTypeChange = (type: typeof activeType) => {
    setLoading(true);
    setActiveType(type);
    setPage(1);
  };

  const clearFilters = () => {
    setLoading(true);
    setSearch("");
    setDebouncedSearch("");
    setStatus("");
    setScheduleDate("");
    setPage(1);
  };

  const handleUpdateStatus = async (id: number, nextStatus: BookingStatus) => {
    try {
      const updated = await updateStaffBookingStatus(id, nextStatus);
      setBookings((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(`Booking for “${updated.names}” marked as ${nextStatus}.`);
      setSelected(null);
      setLoading(true);
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error(
        requestMessage(error, "Unable to update the booking status."),
      );
    }
  };

  const handleBookingUpdated = (updated: Booking) => {
    setBookings((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelected(updated);
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const records = await getAllStaffBookings(currentFilters());

      if (records.length === 0) {
        toast.error("There are no bookings to export for the active filters.");
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
        activeType.label,
        status
          ? `${status.charAt(0).toUpperCase()}${status.slice(1)} status`
          : "All statuses",
        scheduleDate ? `Scheduled ${scheduleDate}` : "All schedule dates",
        debouncedSearch ? `Search: ${debouncedSearch}` : null,
      ]
        .filter(Boolean)
        .join(" • ");

      const logo = await loadParishPdfLogo();
      drawParishPdfLetterhead(doc, logo);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(178, 34, 34);
      doc.text(`${activeType.label} Booking Report`, 14, 29);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(filterSummary, 14, 35);
      doc.text(
        `Generated ${generatedAt} • ${records.length} record${records.length === 1 ? "" : "s"}`,
        14,
        40,
      );

      autoTable(doc, {
        startY: 45,
        margin: { left: 14, right: 14, bottom: 14 },
        head: [
          [
            "Reference",
            "Schedule",
            "Name/s",
            "Contact number",
            "Service",
            "Amount",
            "Status",
          ],
        ],
        body: records.map((item) => [
          item.reference,
          item.date,
          item.names,
          item.contactNumber,
          item.type,
          `PHP ${formatMoneyAmount(item.amount)}`,
          item.status.charAt(0).toUpperCase() + item.status.slice(1),
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
        styles: { fontSize: 8.5, lineColor: [231, 226, 218], lineWidth: 0.15 },
        alternateRowStyles: { fillColor: [250, 248, 245] },
        columnStyles: {
          0: { cellWidth: 31, fontStyle: "bold" },
          1: { cellWidth: 27 },
          3: { cellWidth: 33 },
          4: { cellWidth: 24 },
          5: { cellWidth: 28, halign: "right" },
          6: { cellWidth: 25 },
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
        `${activeType.value}-bookings-${new Date().toISOString().slice(0, 10)}.pdf`,
      );
      toast.success(`${records.length} booking records exported to PDF.`);
    } catch (error) {
      toast.error(
        requestMessage(error, "Unable to export the booking report."),
      );
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = Boolean(search || status || scheduleDate);

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
                <CalendarClock size={23} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                  Parish services
                </p>
                <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                  Booking Management
                </h1>
                <p className="mt-1 text-sm text-white/75">
                  Review sacramental bookings, requirements, schedules, and
                  statuses.
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
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_190px_180px_auto_auto]">
            <label className="relative block">
              <span className="sr-only">Search bookings</span>
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
                placeholder="Search reference, name, or contact..."
                className="h-11 w-full rounded-xl border border-[#E7E2DA] pl-11 pr-4 text-sm outline-none transition focus:border-[#B22222] focus:ring-3 focus:ring-[#B22222]/8"
              />
            </label>

            <label>
              <span className="sr-only">Filter by status</span>
              <select
                value={status}
                onChange={(event) => {
                  setLoading(true);
                  setStatus(event.target.value as BookingStatus | "");
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
              <span className="sr-only">Filter by schedule date</span>
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={scheduleDate}
                onChange={(event) => {
                  setLoading(true);
                  setScheduleDate(event.target.value);
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
              onClick={() => void handleExportPdf()}
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

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {bookingTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`shrink-0 rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${activeType.value === type.value ? "border-[#B22222] bg-[#B22222] text-white shadow-sm" : "border-[#E7E2DA] bg-white text-gray-500 hover:border-[#B22222]/40 hover:text-[#B22222]"}`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-[#EFEAE3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#292524]">
                {activeType.label} bookings
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Results update automatically when filters change.
              </p>
            </div>
            {loading && <Skeleton className="mt-2 h-3 w-24 sm:mt-0" />}
          </div>

          <p className="border-b border-[#EFEAE3] px-5 py-2 text-[11px] text-gray-400 xl:hidden">
            Swipe or scroll sideways to view the remaining booking details.
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
                  <th className="px-5 py-4">Schedule</th>
                  <th className="px-5 py-4">Name/s</th>
                  <th className="px-5 py-4">Contact number</th>
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
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <CalendarClock
                        className="mx-auto text-gray-300"
                        size={34}
                      />
                      <p className="mt-3 font-medium text-gray-600">
                        No {activeType.label.toLowerCase()} bookings found
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        Try changing or clearing the active filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  bookings.map((item) => (
                    <tr
                      key={item.id}
                      className="group border-t border-[#F0EDE7] bg-white transition-colors hover:bg-[#FCFAF7]"
                    >
                      <td className="sticky left-0 z-10 bg-white px-5 py-4 shadow-[8px_0_14px_-14px_rgba(41,37,36,0.65)] transition-colors group-hover:bg-[#FCFAF7] sm:px-6">
                        <span className="font-semibold text-[#292524]">
                          {item.reference}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-gray-400">
                          Record #{item.id}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 tabular-nums text-gray-600">
                        {item.date}
                      </td>
                      <td className="max-w-60 px-5 py-4">
                        <p
                          className="truncate font-semibold text-[#292524]"
                          title={item.names}
                        >
                          {item.names}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          Submitted by {item.details.submittedBy}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 tabular-nums text-gray-500">
                        {item.contactNumber}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums text-[#292524]">
                        {formatPhpCurrency(item.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <BookingStatusBadge status={item.status} />
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

      <BookingDetailModal
        key={selected?.id ?? "closed"}
        booking={selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={handleUpdateStatus}
        onBookingUpdated={handleBookingUpdated}
      />
    </StaffDashboardLayout>
  );
}
