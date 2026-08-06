export type IntentionType =
  | "Special Intention"
  | "Thanksgiving"
  | "Birthday"
  | "Anniversary"
  | "Petition"
  | "Soul";

export interface IntentionEntry {
  id: number;
  names: string[]; // maximum of 3 names
  amount: number | null;
}

export interface IntentionGroup {
  type: IntentionType;
  entries: IntentionEntry[];
}

export interface MassIntentionBooking {
  service: "Mass Intention";

  date: Date | null;

  groups: IntentionGroup[];

  remarks: string;

  referenceNumber: string;
  receipt: File | null;
}