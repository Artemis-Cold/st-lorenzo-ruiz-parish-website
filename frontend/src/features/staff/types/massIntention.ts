import type { IntentionStatus } from "../components/StatusBadge";

export type IntentionType =
  "Anniversary" | "Birthday" | "Petition" | "Soul" | "Thanksgiving";

export interface MassIntention {
  id: number;
  bookingId: number;
  date: string; // dd-mm-yyyy for display
  massTitle: string | null;
  massStartsAt: string | null;
  massTime: string | null;
  massLocation: string | null;
  names: string;
  contactNumber: string;
  type: IntentionType;
  amount: number;
  status: IntentionStatus;
  reference: string;
  paymentReference: string;
  receipt: { fileName: string; url: string } | null;
}
