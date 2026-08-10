import type { IntentionStatus } from "../components/StatusBadge";

export type IntentionType =
  | "Anniversary"
  | "Birthday"
  | "Soul"
  | "Special Intention"
  | "Thanksgiving";

export interface MassIntention {
  id: number;
  date: string; // dd-mm-yyyy for display
  names: string;
  contactNumber: string;
  type: IntentionType;
  amount: number;
  status: IntentionStatus;
}