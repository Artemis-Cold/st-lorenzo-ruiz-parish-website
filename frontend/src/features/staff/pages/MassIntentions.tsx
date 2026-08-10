import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Search, Printer, Plus, Info } from "lucide-react";

import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import StatusBadge, { type IntentionStatus } from "../components/StatusBadge";
import MassIntentionDetailModal from "../components/mass-intentions/MassIntentionDetailModal";
import type { MassIntention, IntentionType } from "../types/massIntention";

const intentionTypes: IntentionType[] = [
  "Anniversary",
  "Birthday",
  "Soul",
  "Special Intention",
  "Thanksgiving",
];

// Mock data — replace with a real fetch/mutations once the backend exists
const initialIntentions: MassIntention[] = Array.from({ length: 14 }).map(
  (_, i) => ({
    id: i + 1,
    date: "12-06-2026",
    names: "John Doe & Jane Doe",
    contactNumber: "0917-000-0000",
    type: intentionTypes[i % intentionTypes.length],
    amount: 500,
    status: i % 5 === 0 ? "approved" : i % 7 === 0 ? "rejected" : "pending",
  }),
);

const PAGE_SIZE = 10;

export default function MassIntentions() {
  const [intentions, setIntentions] =
    useState<MassIntention[]>(initialIntentions);
  const [activeType, setActiveType] = useState<IntentionType>("Anniversary");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MassIntention | null>(null);

  const filtered = useMemo(() => {
    return intentions.filter((item) => {
      if (item.type !== activeType) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        item.names.toLowerCase().includes(q) ||
        item.date.includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    });
  }, [intentions, activeType, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTypeChange = (type: IntentionType) => {
    setActiveType(type);
    setPage(1);
  };

  const handleUpdateStatus = (id: number, status: IntentionStatus) => {
    setIntentions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );

    const item = intentions.find((i) => i.id === id);
    toast.success(`Mass intention for "${item?.names}" has been ${status}.`);

    setSelected(null);
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
                <ClipboardList size={22} />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold sm:text-3xl">
                  Mass Intention Listing
                </h1>
                <p className="mt-1 text-sm text-white/75">
                  Total Listed Intentions: {intentions.length}
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

            <div className="flex shrink-0 gap-3">
              <button
                onClick={() => toast.info("Preparing printable list...")}
                className="flex items-center gap-2 rounded-xl border border-[#E7E2DA] px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={() =>
                  toast.info("Add Mass Intention form coming soon.")
                }
                className="flex items-center gap-2 rounded-xl bg-[#B22222] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8B1C1C]"
              >
                <Plus size={16} />
                Add Mass Intention
              </button>
            </div>
          </div>

          {/* Type tabs */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {intentionTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`shrink-0 rounded-xl border px-5 py-2.5 text-sm font-semibold uppercase tracking-wide transition ${
                  activeType === type
                    ? "border-[#B22222] bg-[#B22222] text-white"
                    : "border-[#E7E2DA] text-gray-500 hover:border-[#B22222]/40 hover:text-[#B22222]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="bg-[#B22222] text-xs font-semibold uppercase tracking-wide text-white">
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Name/s</th>
                  <th className="px-5 py-4">Contact No.</th>
                  <th className="px-5 py-4">Type</th>
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
                      No {activeType.toLowerCase()} intentions found.
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
                        {item.names}
                      </td>
                      <td className="px-5 py-4 tabular-nums text-gray-500">
                        {item.contactNumber}
                      </td>
                      <td className="px-5 py-4 text-gray-500">{item.type}</td>
                      <td className="px-5 py-4 font-semibold text-[#B22222]">
                        ₱{item.amount.toLocaleString()}.00
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
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

      <MassIntentionDetailModal
        intention={selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </StaffDashboardLayout>
  );
}
