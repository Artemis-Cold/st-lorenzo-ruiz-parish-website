export type RequestCategory = "Document";

export type RequestStatus =
  | "pending"
  | "approved"
  | "completed"
  | "rejected"
  | "cancelled";

export interface ServiceRequest {
  id: number;
  bookingId: number;
  date: string; // 00-00-0000 for display
  name: string;
  contactNumber: string;
  category: RequestCategory;
  subtype: string; // e.g. "Baptismal Certificate", "Thanksgiving Mass"
  amount: number;
  status: RequestStatus;
  reference: string;
  paymentReference: string;
  remarks: string | null;
  receipt: { fileName: string; url: string } | null;
  documents: Array<{
    id: number;
    type: string;
    price: number;
    details: Record<string, unknown>;
  }>;
}
