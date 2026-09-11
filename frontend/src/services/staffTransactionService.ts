import api from "@/api/axios";

export type TransactionStatus =
  | "awaiting_payment"
  | "pending_verification"
  | "confirmed"
  | "rejected"
  | "voided";
export type TransactionFilterStatus = TransactionStatus | "pending";
export type TransactionMethod = "gcash" | "cash";
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
  method: TransactionMethod;
  reference: string | null;
  officialReceiptNumber: string | null;
  amount: number;
  receipt: { fileName: string; url: string } | null;
  status: TransactionStatus;
  notes: string | null;
}

export interface StaffTransactionFilters {
  status?: TransactionFilterStatus;
  method?: TransactionMethod;
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
      method: filters.method,
      service: filters.service,
      search: filters.search || undefined,
      date: filters.date || undefined,
      page: filters.page,
      per_page: filters.perPage,
    },
    signal,
  });
  return {
    ...response.data,
    data: response.data.data.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
    })),
  };
}

export async function updateTransactionStatus(
  id: number,
  data: {
    status: "confirmed" | "rejected";
    amount_received?: number;
    official_receipt_number?: string;
    notes?: string;
  },
): Promise<StaffTransaction> {
  const response = await api.patch<{ data: StaffTransaction }>(
    `/staff/transactions/${id}/status`,
    data,
  );
  return {
    ...response.data.data,
    amount: Number(response.data.data.amount),
  };
}
