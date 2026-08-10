import api from "@/api/axios";

export type TransactionStatus = "pending" | "confirmed" | "rejected";
export interface StaffTransaction {
  id: number; date: string; name: string; contactNumber: string;
  type: "Mass Intention" | "Document Request"; reference: string;
  amount: number; receipt: { fileName: string; url: string }; status: TransactionStatus;
}

export async function getStaffTransactions(): Promise<StaffTransaction[]> {
  const response = await api.get<{ data: StaffTransaction[] }>("/staff/transactions");
  return response.data.data;
}

export async function updateTransactionStatus(id: number, status: Exclude<TransactionStatus, "pending">): Promise<StaffTransaction> {
  const response = await api.patch<{ data: StaffTransaction }>(`/staff/transactions/${id}/status`, { status });
  return response.data.data;
}
