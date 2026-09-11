import type { DocumentOwnerRelationship } from "../../../types/document";

export const documentOwnerRelationships: Array<{
  label: string;
  value: DocumentOwnerRelationship;
}> = [
  { label: "Select relationship", value: "" },
  { label: "Self", value: "Self" },
  { label: "Parent", value: "Parent" },
  { label: "Child", value: "Child" },
  { label: "Spouse", value: "Spouse" },
  { label: "Sibling", value: "Sibling" },
  { label: "Legal Guardian", value: "Legal Guardian" },
  { label: "Other Relative", value: "Other Relative" },
];

export const deathRecordRelationships = documentOwnerRelationships.filter(
  (relationship) => relationship.value !== "Self",
);
