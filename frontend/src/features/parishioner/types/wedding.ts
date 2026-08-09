export type ApplicantType = "groom" | "bride";

export interface PersonName {
  first_name: string;
  middle_initial: string;
  last_name: string;
}

export interface ChurchInformation {
  baptized_in: string;
  confirmed_in: string;
}

export interface PreviousChurchMarriage {
  church_name: string;
  priest: string;
  church_address: string;
}

export interface Person extends PersonName {
  address: string;
  age: number | null;
  contact_number: string;

  church: ChurchInformation;

  father: PersonName;
  mother: PersonName;

  previous_church_marriage: PreviousChurchMarriage;
}

export interface WeddingDocument {
  document_type:
    | "marriage_license"
    | "cenomar"
    | "baptismal_certificate"
    | "confirmation_certificate"
    | "couple_photo"
    | "sponsor_marriage_contract"
    | "sponsor_confirmation_certificate";

  file: File;
}

export interface WeddingBooking {
  booking_slot_id: number;

  service_package_id: number;

  selected_addon_ids: number[];

  applicant: {
    groom: Person;
    bride: Person;
  };

  documents: WeddingDocument[];

  remarks: string;
}