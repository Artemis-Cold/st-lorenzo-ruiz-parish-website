import { useEffect, useMemo, useState } from "react";
import { Receipt, Search } from "lucide-react";
import { toast } from "sonner";

import { getStaffTransactions, updateTransactionStatus, type StaffTransaction } from "@/services/staffTransactionService";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";

export default function Transactions() {
  const [items, setItems] = useState<StaffTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { getStaffTransactions().then(setItems).catch(() => toast.error("Unable to load transactions.")).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => items.filter((item) => `${item.name} ${item.reference} ${item.type}`.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const changeStatus = async (item: StaffTransaction, status: "confirmed" | "rejected") => {
    try { const updated = await updateTransactionStatus(item.id, status); setItems((all) => all.map((current) => current.id === updated.id ? updated : current)); toast.success(`Payment ${status}.`); }
    catch { toast.error("Unable to update payment status."); }
  };

  return <StaffDashboardLayout><div className="space-y-6">
    <div className="rounded-3xl bg-[#B22222] px-8 py-9 text-white"><div className="flex items-center gap-4"><Receipt /><div><h1 className="font-serif text-3xl font-bold">Transactions</h1><p className="text-sm text-white/75">Verify GCash references and attached receipts.</p></div></div></div>
    <div className="rounded-3xl border border-[#E7E2DA] bg-white p-5"><div className="relative max-w-sm"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or reference..." className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none" /></div></div>
    <div className="overflow-x-auto rounded-3xl border border-[#E7E2DA] bg-white"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#B22222] text-white"><tr>{["Date","Name","Type","GCash Reference","Amount","Receipt","Status","Action"].map((label) => <th key={label} className="px-5 py-4">{label}</th>)}</tr></thead><tbody>
      {filtered.length ? filtered.map((item) => <tr key={item.id} className="border-t"><td className="px-5 py-4">{item.date}</td><td className="px-5 py-4 font-medium">{item.name}<div className="text-xs text-gray-400">{item.contactNumber}</div></td><td className="px-5 py-4">{item.type}</td><td className="px-5 py-4">{item.reference}</td><td className="px-5 py-4 font-semibold text-[#B22222]">₱{item.amount.toLocaleString()}.00</td><td className="px-5 py-4"><a href={item.receipt.url} target="_blank" rel="noreferrer" className="text-[#B22222] hover:underline">{item.receipt.fileName}</a></td><td className="px-5 py-4 capitalize">{item.status}</td><td className="px-5 py-4">{item.status === "pending" && <div className="flex gap-2"><button onClick={() => changeStatus(item,"confirmed")} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white">Confirm</button><button onClick={() => changeStatus(item,"rejected")} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">Reject</button></div>}</td></tr>) : <tr><td colSpan={8} className="px-5 py-14 text-center text-gray-400">{loading ? "Loading transactions..." : "No transactions found."}</td></tr>}
    </tbody></table></div>
  </div></StaffDashboardLayout>;
}
