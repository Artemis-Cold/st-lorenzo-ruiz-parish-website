import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, FileImage, Receipt, Search } from "lucide-react";
import { toast } from "sonner";

import {
  getStaffTransactions,
  updateTransactionStatus,
  type StaffTransaction,
  type TransactionStatus,
} from "@/services/staffTransactionService";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import RejectConfirmationButton from "../components/RejectConfirmationButton";

const PAGE_SIZE = 10;

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

function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[status]}`}
      />
      {status}
    </span>
  );
}

export default function Transactions() {
  const [items, setItems] = useState<StaffTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getStaffTransactions()
      .then(setItems)
      .catch(() => toast.error("Unable to load transactions."))
      .finally(() => setLoading(false));
  }, []);
  const filtered = useMemo(
    () =>
      items.filter((item) =>
        `${item.name} ${item.type}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [items, search],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const changeStatus = async (
    item: StaffTransaction,
    status: "confirmed" | "rejected",
  ) => {
    try {
      const updated = await updateTransactionStatus(item.id, status);
      setItems((all) =>
        all.map((current) => (current.id === updated.id ? updated : current)),
      );
      toast.success(`Payment ${status}.`);
    } catch {
      toast.error("Unable to update payment status.");
    }
  };

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#B22222] px-8 py-9 text-white">
          <div className="flex items-center gap-4">
            <Receipt />
            <div>
              <h1 className="font-serif text-3xl font-bold">Transactions</h1>
              <p className="text-sm text-white/75">
                Verify GCash references and attached receipts.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-[#E7E2DA] bg-white p-5">
          <div className="relative max-w-sm">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name or type..."
              className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none"
            />
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="bg-[#B22222] text-white">
              <tr>
                {[
                  "Date",
                  "Name",
                  "Type",
                  "Amount",
                  "Receipt",
                  "Status",
                  "Action",
                ].map((label) => (
                  <th
                    key={label}
                    className={`px-5 py-4 ${label === "Date" ? "min-w-[8rem] whitespace-nowrap" : ""}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length ? (
                paginated.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t transition hover:bg-[#FAF8F5]"
                  >
                    <td className="min-w-[8rem] whitespace-nowrap px-5 py-4 tabular-nums text-gray-600">
                      {item.date}
                    </td>
                    <td className="px-5 py-4 font-medium">
                      {item.name}
                      <div className="text-xs text-gray-400">
                        {item.contactNumber}
                      </div>
                    </td>
                    <td className="px-5 py-4">{item.type}</td>
                    <td className="px-5 py-4 font-semibold text-[#B22222]">
                      ₱{item.amount.toLocaleString()}.00
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={item.receipt.url}
                        target="_blank"
                        rel="noreferrer"
                        title={`Open ${item.receipt.fileName} in a new tab`}
                        className="group inline-flex items-center gap-2.5 rounded-xl border border-[#E7E2DA] bg-white py-2 pl-2 pr-3 text-xs font-semibold text-[#292524] shadow-sm transition hover:-translate-y-0.5 hover:border-[#B22222]/30 hover:bg-red-50 hover:text-[#B22222] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#B22222]/20"
                      >
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-[#B22222] transition group-hover:bg-[#B22222] group-hover:text-white">
                          <FileImage size={15} />
                        </span>
                        <span>View receipt</span>
                        <ArrowUpRight
                          size={14}
                          className="text-gray-400 transition group-hover:text-[#B22222]"
                        />
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <TransactionStatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4">
                      {item.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => changeStatus(item, "confirmed")}
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Confirm
                          </button>
                          <RejectConfirmationButton
                            itemLabel="payment"
                            onConfirm={() => changeStatus(item, "rejected")}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-14 text-center text-gray-400"
                  >
                    {loading
                      ? "Loading transactions..."
                      : "No transactions found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          {filtered.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#F0EDE7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-[#E7E2DA] px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm tabular-nums text-gray-500">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
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
    </StaffDashboardLayout>
  );
}
