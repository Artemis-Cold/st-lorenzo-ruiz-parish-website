export type IntentionType =
  "Thanksgiving" | "Birthday" | "Anniversary" | "Petition" | "Soul";

export interface IntentionEntry {
  id: number;
  names: string[];
}

export interface IntentionGroup {
  type: IntentionType;
  entries: IntentionEntry[];
}

export interface MassIntentionBooking {
  intention_date: Date | null;
  mass_event_id: number;
  groups: IntentionGroup[];
  remarks: string;
  payment_method: "gcash";
  reference_number: string;
  receipt: File | null;
}
