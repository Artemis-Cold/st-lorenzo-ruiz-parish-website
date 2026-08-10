export type RequestCategory = "Document" | "Special Mass";

export type RequestStatus =
  | "pending"
  | "processing"
  | "ready"
  | "completed"
  | "rejected";

export interface ServiceRequest {
  id: number;
  date: string; // 00-00-0000 for display
  name: string;
  contactNumber: string;
  category: RequestCategory;
  subtype: string; // e.g. "Baptismal Certificate", "Thanksgiving Mass"
  amount: number;
  status: RequestStatus;
}