export interface PersonName {
  first_name: string;
  middle_initial: string;
  last_name: string;
}

export interface Sacraments {
  baptized: boolean;
  confirmed: boolean;
  church_married: boolean;
  anointed_of_the_sick: boolean;
}

export type Participation = "regular" | "sometimes" | "never";

export interface ChurchLife {
  attends_mass: Participation | "";
  confesses: Participation | "";
}

export interface Informant extends PersonName {
  relationship: string;
  contact_number: string;
  date_provided: Date | null;
}

export interface Deceased extends PersonName {
  address: string;
  death_cause: string;
  age: number | null;
  birth_date: Date | null;
  father: PersonName;
  mother: PersonName;
  has_spouse: boolean;
  spouse: PersonName;
  children: PersonName[];
  sacraments: Sacraments;
  church_life: ChurchLife;
  characteristics: string;
  informant: Informant;
}

export interface FuneralDocument {
  document_type: "death_certificate" | "biography";
  file: File;
}

export interface FuneralBooking {
  booking_slot_id: number;
  service_package_id: number;
  selected_addon_ids: number[];
  deceased: Deceased;
  documents: FuneralDocument[];
  remarks: string;
}
