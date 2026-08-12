export interface PersonName {
  first_name: string;
  middle_initial: string;
  last_name: string;
}
export interface Parent extends PersonName {
  relationship: "father" | "mother";
  birth_place: string;
}

export interface GodParent extends PersonName {
  role: "godfather" | "godmother";
  residence: string;
}

export interface GodParentPair {
  god_father: GodParent;
  god_mother: GodParent;

  requirements: {
    marriage_contract: File | null;
    confirmation_certificate: File | null;
  };
}

export interface Baptizand extends PersonName {
  birth_date: Date | null;

  birth_place: string | null;

  gender: "" | "Male" | "Female";

  address: string;

  contact_number: string | null;
}

export interface BaptismDocument {
  document_type:
    | "birth_certificate"
    | "baptism_permit"
    | "no_record_certificate";

  file: File;
}

export interface BaptismBooking {
  booking_slot_id: number;

  service_package_id: number;

  seminar_date: Date| null;

  baptizand: Baptizand;

  parents: Parent[];

  god_parents: GodParentPair[];

  documents: BaptismDocument[];

  remarks: string;
}
