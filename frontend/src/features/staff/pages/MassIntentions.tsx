import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  CalendarDays,
  Clock3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FileDown,
  FilterX,
  LoaderCircle,
  Search,
} from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

import { Skeleton, TableSkeletonRows } from "@/components/ui/skeleton";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import StatusBadge, { type IntentionStatus } from "../components/StatusBadge";
import MassIntentionDetailModal from "../components/mass-intentions/MassIntentionDetailModal";
import type { IntentionType, MassIntention } from "../types/massIntention";
import {
  getAllStaffMassIntentions,
  getStaffMassIntentions,
  type StaffMassIntentionFilters,
  type StaffMassIntentionPage,
} from "@/services/staffManagementService";

import {
  drawParishPdfLetterhead,
  loadParishPdfLogo,
} from "../utils/pdfLetterhead";
import { formatMoneyAmount, formatPhpCurrency } from "@/utils/currency";

const intentionTypes: IntentionType[] = [
  "Anniversary",
  "Birthday",
  "Petition",
  "Soul",
  "Thanksgiving",
];

const statusOptions: Array<{ label: string; value: IntentionStatus | "" }> = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const massTimeOptions = [
  { label: "All Mass times", value: "" },
  { label: "6:00 AM", value: "06:00" },
  { label: "9:00 AM", value: "09:00" },
  { label: "4:30 PM", value: "16:30" },
];

const emptyMeta: StaffMassIntentionPage["meta"] = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

const chunk = <T,>(items: T[], size: number): T[][] => {
  if (items.length === 0) return [[]];
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
};

function drawFormHeader(
  doc: jsPDF,
  date: string,
  time: string | null,
  logo: HTMLImageElement,
  continuation?: string,
) {
  const pageWidth = doc.internal.pageSize.getWidth();

  drawParishPdfLetterhead(doc, logo);
  doc.setTextColor(35, 35, 35);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`DATE: ${date}`, 16, 31);
  doc.text(`TIME: ${time ?? "____________________"}`, 65, 31);

  if (continuation) {
    doc.setFontSize(7);
    doc.setTextColor(110, 110, 110);
    doc.text(continuation, pageWidth - 16, 37, { align: "right" });
  }
}

function drawIntentionSection(
  doc: jsPDF,
  title: string,
  records: MassIntention[],
  startY: number,
  rows: number,
  rowHeight: number,
) {
  const left = 16;
  const right = 194;
  const amountStart = 156;

  doc.setTextColor(35, 35, 35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(title.toUpperCase(), left, startY);
  doc.text("AMOUNT", right, startY, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  for (let index = 0; index < rows; index += 1) {
    const baseline = startY + 5.5 + index * rowHeight;
    const record = records[index];
    doc.text(`${index + 1}`, left, baseline);
    doc.line(left + 8, baseline + 0.8, amountStart - 4, baseline + 0.8);
    doc.line(amountStart, baseline + 0.8, right, baseline + 0.8);

    if (record) {
      const name =
        doc.splitTextToSize(record.names, amountStart - left - 16)[0] ??
        record.names;
      doc.text(name, left + 10, baseline - 0.5);
      doc.text(formatMoneyAmount(record.amount), right - 1, baseline - 0.5, {
        align: "right",
      });
    }
  }
}

function exportParishMassForm(
  doc: jsPDF,
  records: MassIntention[],
  logo: HTMLImageElement,
) {
  const recordsBySchedule = new Map<string, MassIntention[]>();
  records.forEach((record) => {
    const key = `${record.date}|${record.massStartsAt ?? "unscheduled"}`;
    recordsBySchedule.set(key, [...(recordsBySchedule.get(key) ?? []), record]);
  });

  let hasPage = false;
  const addPage = () => {
    if (hasPage) doc.addPage();
    hasPage = true;
  };

  [...recordsBySchedule.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([, dateRecords]) => {
      const date = dateRecords[0]?.date ?? "";
      const massTime = dateRecords[0]?.massTime ?? null;
      const thanksgivingPages = chunk(
        dateRecords.filter((record) => record.type === "Thanksgiving"),
        30,
      );
      const birthdayPages = chunk(
        dateRecords.filter(
          (record) =>
            record.type === "Birthday" || record.type === "Anniversary",
        ),
        10,
      );
      const petitionPages = chunk(
        dateRecords.filter((record) => record.type === "Petition"),
        10,
      );
      const soulPages = chunk(
        dateRecords.filter((record) => record.type === "Soul"),
        10,
      );

      thanksgivingPages.forEach((pageRecords, index) => {
        addPage();
        drawFormHeader(
          doc,
          date,
          massTime,
          logo,
          thanksgivingPages.length > 1
            ? `Thanksgiving ${index + 1} of ${thanksgivingPages.length}`
            : undefined,
        );
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("MGA PAMISA SA PAROKYA NI SAN LORENZO RUIZ", 105, 40, {
          align: "center",
        });
        drawIntentionSection(doc, "Thanksgiving", pageRecords, 49, 30, 7.55);
      });

      const detailPageCount = Math.max(
        birthdayPages.length,
        petitionPages.length,
        soulPages.length,
      );

      for (let index = 0; index < detailPageCount; index += 1) {
        addPage();
        drawFormHeader(
          doc,
          date,
          massTime,
          logo,
          detailPageCount > 1
            ? `Other intentions ${index + 1} of ${detailPageCount}`
            : undefined,
        );
        drawIntentionSection(
          doc,
          "Birthday / Anniversary",
          birthdayPages[index] ?? [],
          43,
          10,
          6.2,
        );
        drawIntentionSection(
          doc,
          "Petition",
          petitionPages[index] ?? [],
          113,
          10,
          6.2,
        );
        drawIntentionSection(doc, "Soul", soulPages[index] ?? [], 183, 10, 6.2);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text(
          "Para sa pasasalamat at kahilingan ng lahat ng may magandang kalooban, kasama ang kanilang mga mahal sa buhay na patuloy na tumutulong sa pagtataguyod ng ating parokya.",
          16,
          254,
          { maxWidth: 178 },
        );
        doc.text("RECEIVED BY: ______________________________", 16, 274);
        doc.setFont("helvetica", "bold");
        doc.text(
          `TOTAL: PHP ${formatMoneyAmount(dateRecords.reduce((total, record) => total + Number(record.amount), 0))}`,
          194,
          274,
          { align: "right" },
        );
      }
    });
}

const requestMessage = (error: unknown, fallback: string) => {
  if (!(error instanceof AxiosError)) return fallback;
  const message = error.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

const getToday = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60_000;

  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

export default function MassIntentions() {
  const [intentions, setIntentions] = useState<MassIntention[]>([]);
  const [meta, setMeta] = useState<StaffMassIntentionPage["meta"]>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [intentionType, setIntentionType] = useState<IntentionType | "">("");
  const [status, setStatus] = useState<IntentionStatus | "">("paid");
  const [intentionDate, setIntentionDate] = useState(getToday);
  const [massTime, setMassTime] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MassIntention | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    getStaffMassIntentions(
      {
        type: intentionType || undefined,
        status: status || undefined,
        date: intentionDate || undefined,
        time: massTime || undefined,
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

        setIntentions(result.data);
        setMeta(result.meta);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          toast.error("Unable to load mass intentions.");
          setIntentions([]);
          setMeta(emptyMeta);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [intentionType, status, intentionDate, massTime, debouncedSearch, page]);

  const currentFilters = (): Omit<
    StaffMassIntentionFilters,
    "page" | "perPage"
  > => ({
    type: intentionType || undefined,
    status: status || undefined,
    date: intentionDate || undefined,
    time: massTime || undefined,
    search: debouncedSearch || undefined,
  });

  const clearFilters = () => {
    setLoading(true);
    setSearch("");
    setDebouncedSearch("");
    setIntentionType("");
    setStatus("paid");
    setIntentionDate("");
    setMassTime("");
    setPage(1);
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const records = await getAllStaffMassIntentions(currentFilters());

      if (records.length === 0) {
        toast.error(
          "There are no mass intentions to export for the active filters.",
        );
        return;
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const logo = await loadParishPdfLogo();
      exportParishMassForm(doc, records, logo);
      doc.save(`mass-intentions-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success(
        `${records.length} mass intention records exported to PDF.`,
      );
    } catch (error) {
      toast.error(
        requestMessage(error, "Unable to export the mass intention report."),
      );
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = Boolean(
    search || intentionType || status !== "paid" || intentionDate || massTime,
  );

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
                <ClipboardList size={23} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                  Liturgical requests
                </p>
                <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                  Mass Intention Listing
                </h1>
                <p className="mt-1 text-sm text-white/75">
                  Review submitted intentions, payment information, and
                  celebration dates.
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
          <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(220px,1fr)_170px_150px_165px_145px_105px_140px]">
            <label className="relative block min-w-0">
              <span className="sr-only">Search mass intentions</span>
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

            <label className="min-w-0">
              <span className="sr-only">Filter by intention type</span>
              <select
                value={intentionType}
                onChange={(event) => {
                  setLoading(true);
                  setIntentionType(event.target.value as IntentionType | "");
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-[#E7E2DA] bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#B22222]"
              >
                <option value="">All intention types</option>
                {intentionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="min-w-0">
              <span className="sr-only">Filter by status</span>
              <select
                value={status}
                onChange={(event) => {
                  setLoading(true);
                  setStatus(event.target.value as IntentionStatus | "");
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

            <label className="relative block min-w-0">
              <span className="sr-only">Filter by intention date</span>
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={intentionDate}
                onChange={(event) => {
                  setLoading(true);
                  setIntentionDate(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-[#E7E2DA] bg-white pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-[#B22222]"
              />
            </label>

            <label className="relative block min-w-0">
              <span className="sr-only">Filter by Mass time</span>
              <Clock3
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={massTime}
                onChange={(event) => {
                  setLoading(true);
                  setMassTime(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-[#E7E2DA] bg-white pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-[#B22222]"
              >
                {massTimeOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="inline-flex h-11 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#E7E2DA] px-4 text-sm font-semibold text-gray-600 transition hover:border-[#B22222]/30 hover:bg-red-50 hover:text-[#B22222] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FilterX size={16} /> Reset
            </button>
            <button
              type="button"
              onClick={() => void exportPdf()}
              disabled={exporting || loading}
              className="inline-flex h-11 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#B22222] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-60"
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
                {intentionType
                  ? `${intentionType} intentions`
                  : "All mass intentions"}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Paid intentions are shown initially. Results update
                automatically when filters change.
              </p>
            </div>
            {loading && <Skeleton className="mt-2 h-3 w-24 sm:mt-0" />}
          </div>

          <p className="border-b border-[#EFEAE3] px-5 py-2 text-[11px] text-gray-400 xl:hidden">
            Swipe or scroll sideways to view the remaining intention details.
          </p>
          <div
            data-table-scroll="true"
            className="overflow-x-auto overscroll-x-contain"
          >
            <table className="w-full min-w-210 text-left text-sm">
              <thead>
                <tr className="bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                  <th className="sticky left-0 z-20 bg-[#FAF8F5] px-5 py-4 shadow-[8px_0_14px_-14px_rgba(41,37,36,0.75)] sm:px-6">
                    Reference
                  </th>
                  <th className="px-5 py-4">Intention date</th>
                  <th className="px-5 py-4">Name/s</th>
                  <th className="px-5 py-4">Type</th>
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
                  <TableSkeletonRows columns={8} />
                ) : intentions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <ClipboardList
                        className="mx-auto text-gray-300"
                        size={34}
                      />
                      <p className="mt-3 font-medium text-gray-600">
                        No matching mass intentions found
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        Try changing or resetting the active filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  intentions.map((item) => (
                    <tr
                      key={item.id}
                      className="group border-t border-[#F0EDE7] bg-white transition-colors hover:bg-[#FCFAF7]"
                    >
                      <td className="sticky left-0 z-10 bg-white px-5 py-4 shadow-[8px_0_14px_-14px_rgba(41,37,36,0.65)] transition-colors group-hover:bg-[#FCFAF7] sm:px-6">
                        <span className="font-semibold text-[#292524]">
                          {item.reference}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-gray-400">
                          Intention #{item.id}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 tabular-nums text-gray-600">
                        {item.date}
                        {item.massTime && (
                          <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-[#B22222]">
                            <Clock3 size={11} /> {item.massTime}
                          </span>
                        )}
                      </td>
                      <td className="max-w-64 px-5 py-4">
                        <p
                          className="truncate font-semibold text-[#292524]"
                          title={item.names}
                        >
                          {item.names}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {item.type}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 tabular-nums text-gray-500">
                        {item.contactNumber}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums text-[#292524]">
                        {formatPhpCurrency(item.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
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

      <MassIntentionDetailModal
        intention={selected}
        onClose={() => setSelected(null)}
      />
    </StaffDashboardLayout>
  );
}
