export type DocumentType =
  | "Baptismal Certificate"
  | "Confirmation Certificate"
  | "Death Certificate"
  | "Marriage Certificate"
  | "Publication of Marriage Bans"
  | "Request of Permission";

export interface BaptismalCertificateDetails {
  name: string;
  address: string;
  baptismDate: Date | null;
}

export interface ConfirmationCertificateDetails {
  name: string;
  address: string;
  confirmationDate: Date | null;
}

export interface DeathCertificateDetails {
  name: string;
  address: string;
}

export interface MarriageCertificateDetails {
  brideName: string;
  groomName: string;
  address: string;
  marriageDate: Date | null;
}

export interface MarriageBansDetails {
  brideName: string;
  groomName: string;
  address: string;
  marriageDate: Date | null;
}

export interface PermissionRequestDetails {
  fullName: string;
  address: string;
}

export type DocumentDetails =
  | BaptismalCertificateDetails
  | ConfirmationCertificateDetails
  | DeathCertificateDetails
  | MarriageCertificateDetails
  | MarriageBansDetails
  | PermissionRequestDetails;

export interface DocumentRequest {
  id: number;

  documentType: DocumentType;

  /** Price of this document request */
  price: number;

  details: DocumentDetails;
}

export interface DocumentRequestBooking {
  service: "Document Request";

  requests: DocumentRequest[];

  remarks: string;

  referenceNumber: string;
  receipt: File | null;
}