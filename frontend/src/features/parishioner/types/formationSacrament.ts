export type FormationSacramentCode = "confirmation" | "first-communion";

export interface FormationSacramentPerson {
  first_name: string;
  middle_initial: string;
  last_name: string;
  suffix: string;
}

export interface FormationSacramentParent extends FormationSacramentPerson {
  relationship: "father" | "mother";
  birth_place: string;
}

export interface FormationSacramentSponsor extends FormationSacramentPerson {
  role: "godfather" | "godmother";
  address: string;
  requirement_type: "" | "marriage_contract" | "confirmation_certificate";
  requirement_file: File | null;
}

export interface FormationSacramentBooking {
  booking_slot_id: number;
  service_package_id: number;
  candidate: FormationSacramentPerson & {
    parish_origin: string;
    baptism_date: string;
    baptism_church: string;
    birth_date: string;
    birth_place: string;
    gender: "" | "Male" | "Female";
    address: string;
    contact_number: string;
  };
  parents: FormationSacramentParent[];
  sponsors: FormationSacramentSponsor[];
  baptismal_certificate: File | null;
  remarks: string;
}
