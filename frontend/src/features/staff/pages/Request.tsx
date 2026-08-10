import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FileText, Search, Printer, Info } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import RequestStatusBadge from "../components/requests/RequestStatusBadge";
import RequestDetailModal from "../components/requests/RequestDetailModal";
import type {
  ServiceRequest,
  RequestCategory,
  RequestStatus,
} from "../types/request";
import {
  getStaffDocumentRequests,
  updateDocumentRequestStatus,
} from "@/services/staffManagementService";
import { formatLabel } from "../utils/formatLabel";

const categories: RequestCategory[] = ["Document"];

const PAGE_SIZE = 10;

export default function Requests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] =
    useState<RequestCategory>("Document");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    let active = true;

    getStaffDocumentRequests()
      .then((data) => {
        if (active) setRequests(data);
      })
      .catch(() => toast.error("Unable to load document requests."))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const documentTotal = useMemo(
    () => requests.filter((r) => r.category === "Document").length,
    [requests],
  );
  const filtered = useMemo(() => {
    return requests.filter((item) => {
      if (item.category !== activeCategory) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.date.includes(q) ||
        item.subtype.toLowerCase().includes(q)
      );
    });
  }, [requests, activeCategory, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCategoryChange = (category: RequestCategory) => {
    setActiveCategory(category);
    setPage(1);
  };

  const handleUpdateStatus = async (id: number, status: RequestStatus) => {
    try {
      const updated = await updateDocumentRequestStatus(id, status);
      setRequests((items) =>
        items.map((item) =>
          item.bookingId === updated.bookingId ? { ...item, status } : item,
        ),
      );
      toast.success(`Request from "${updated.name}" marked as ${status}.`);
      setSelected(null);
    } catch {
      toast.error("Unable to update the document request status.");
    }
  };

  const handleExportPdf = () => {
    if (filtered.length === 0) {
      toast.error("There's nothing to export for this filter.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(`Requests — ${activeCategory}`, 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Generated ${new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      14,
      22,
    );

    autoTable(doc, {
      startY: 28,
      head: [
        ["ID", "Date", "Name", "Contact No.", "Requested", "Amount", "Status"],
      ],
      body: filtered.map((item) => [
        String(item.id).padStart(2, "0"),
        item.date,
        item.name,
        item.contactNumber,
        formatLabel(item.subtype),
        `P${item.amount.toLocaleString()}.00`,
        item.status.charAt(0).toUpperCase() + item.status.slice(1),
      ]),
      headStyles: { fillColor: [178, 34, 34] },
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [250, 248, 245] },
    });

    doc.save(
      `requests-${activeCategory.toLowerCase().replace(/\s+/g, "-")}.pdf`,
    );

    toast.success("PDF exported successfully.");
  };

  return (
    <StaffDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Page header */}
        <div className="relative overflow-hidden rounded-3xl bg-[#B22222] px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/[0.06]"
          />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <FileText size={22} />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold sm:text-3xl">
                  Requests
                </h1>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/75">
                  <span>Total Document Requests: {documentTotal}</span>
                </p>
              </div>
            </div>

            <button
              aria-label="Info"
              className="shrink-0 rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Info size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="rounded-3xl border border-[#E7E2DA] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-sm">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, type, date..."
                className="w-full rounded-xl border border-[#E7E2DA] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#B22222]"
              />
            </div>

            <button
              onClick={handleExportPdf}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E7E2DA] px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <Printer size={16} />
              Export PDF
            </button>
          </div>

          {/* Category tabs */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`shrink-0 rounded-xl border px-5 py-2.5 text-sm font-semibold uppercase tracking-wide transition ${
                  activeCategory === category
                    ? "border-[#B22222] bg-[#B22222] text-white"
                    : "border-[#E7E2DA] text-gray-500 hover:border-[#B22222]/40 hover:text-[#B22222]"
                }`}
              >
                {category} Request
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="bg-[#B22222] text-xs font-semibold uppercase tracking-wide text-white">
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Contact No.</th>
                  <th className="px-5 py-4">Requested</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-14 text-center text-gray-400"
                    >
                      {loading
                        ? "Loading document requests..."
                        : `No ${activeCategory.toLowerCase()} requests found.`}
                    </td>
                  </tr>
                ) : (
                  paginated.map((item, i) => (
                    <tr
                      key={item.id}
                      className={`border-t border-[#F0EDE7] ${
                        i % 2 === 1 ? "bg-[#FAF8F5]" : "bg-white"
                      }`}
                    >
                      <td className="px-5 py-4 tabular-nums text-gray-500">
                        {String(item.id).padStart(2, "0")}
                      </td>
                      <td className="px-5 py-4 tabular-nums">{item.date}</td>
                      <td className="px-5 py-4 font-medium text-[#292524]">
                        {item.name}
                      </td>
                      <td className="px-5 py-4 tabular-nums text-gray-500">
                        {item.contactNumber}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {formatLabel(item.subtype)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#B22222]">
                        ₱{item.amount.toLocaleString()}.00
                      </td>
                      <td className="px-5 py-4">
                        <RequestStatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelected(item)}
                          className="rounded-lg border border-[#E7E2DA] px-4 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-[#B22222]/40 hover:text-[#B22222]"
                        >
                          More
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#F0EDE7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-[#E7E2DA] px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-sm tabular-nums text-gray-500">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-[#E7E2DA] px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <RequestDetailModal
        request={selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </StaffDashboardLayout>
  );
}
