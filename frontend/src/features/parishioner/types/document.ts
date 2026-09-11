export type DocumentType =
  | "Baptismal Certificate"
  | "Confirmation Certificate"
  | "Death Certificate"
  | "Marriage Certificate"
  | "Request of Permission";

export type DocumentOwnerRelationship =
  | ""
  | "Self"
  | "Parent"
  | "Child"
  | "Spouse"
  | "Sibling"
  | "Legal Guardian"
  | "Other Relative";

export interface DocumentRequesterProfile {
  fullName: string;
  address: string;
  phone: string;
  gender: string | null;
}

export interface BaptismalCertificateDetails {
  name: string;
  address: string;
  baptism_date: Date | null;
  relationship_to_owner: DocumentOwnerRelationship;
}

export interface ConfirmationCertificateDetails {
  name: string;
  address: string;
  confirmation_date: Date | null;
  relationship_to_owner: DocumentOwnerRelationship;
}

export interface DeathCertificateDetails {
  name: string;
  address: string;
  relationship_to_owner: Exclude<DocumentOwnerRelationship, "Self">;
}

export interface MarriageCertificateDetails {
  bride_name: string;
  groom_name: string;
  address: string;
  marriage_date: Date | null;
  requester_role: "" | "Bride" | "Groom";
}

export interface PermissionRequestDetails {
  full_name: string;
  address: string;
}

export type DocumentDetails =
  | BaptismalCertificateDetails
  | ConfirmationCertificateDetails
  | DeathCertificateDetails
  | MarriageCertificateDetails
  | PermissionRequestDetails;

export type DocumentDetailValue = string | Date | null;

export interface DocumentRequest {
  id: number;
  document_type: DocumentType;
  price: number;
  details: DocumentDetails;
}

export interface DocumentRequestBooking {
  requests: DocumentRequest[];
  remarks: string;
  payment_method: "gcash" | "cash";
  reference_number: string;
  receipt: File | null;
}
