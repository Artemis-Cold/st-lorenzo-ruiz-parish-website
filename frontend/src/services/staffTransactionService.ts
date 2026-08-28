import api from "@/api/axios";

export type TransactionStatus = "pending" | "confirmed" | "rejected";
export type TransactionService =
  "mass-intention" | "document-request" | "baptism" | "wedding" | "funeral";
export interface StaffTransaction {
  id: number;
  date: string;
  name: string;
  contactNumber: string;
  type:
    "Mass Intention" | "Document Request" | "Baptism" | "Wedding" | "Funeral";
  bookingReference: string;
  reference: string | null;
  amount: number;
  receipt: { fileName: string; url: string };
  status: TransactionStatus;
}

export interface StaffTransactionFilters {
  status?: TransactionStatus;
  service?: TransactionService;
  search?: string;
  date?: string;
  page?: number;
  perPage?: number;
}

export interface StaffTransactionPage {
  data: StaffTransaction[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

export async function getStaffTransactions(
  filters: StaffTransactionFilters = {},
  signal?: AbortSignal,
): Promise<StaffTransactionPage> {
  const response = await api.get<StaffTransactionPage>("/staff/transactions", {
    params: {
      status: filters.status,
      service: filters.service,
      search: filters.search || undefined,
      date: filters.date || undefined,
      page: filters.page,
      per_page: filters.perPage,
    },
    signal,
  });
  return response.data;
}

export async function updateTransactionStatus(
  id: number,
  status: Exclude<TransactionStatus, "pending">,
): Promise<StaffTransaction> {
  const response = await api.patch<{ data: StaffTransaction }>(
    `/staff/transactions/${id}/status`,
    { status },
  );
  return response.data.data;
}
