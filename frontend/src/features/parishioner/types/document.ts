export type DocumentType =
  | "Baptismal Certificate"
  | "Confirmation Certificate"
  | "Death Certificate"
  | "Marriage Certificate"
  | "Request of Permission";

export interface BaptismalCertificateDetails {
  name: string;
  address: string;
  baptism_date: Date | null;
}

export interface ConfirmationCertificateDetails {
  name: string;
  address: string;
  confirmation_date: Date | null;
}

export interface DeathCertificateDetails {
  name: string;
  address: string;
}

export interface MarriageCertificateDetails {
  bride_name: string;
  groom_name: string;
  address: string;
  marriage_date: Date | null;
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
  reference_number: string;
  receipt: File | null;
}
