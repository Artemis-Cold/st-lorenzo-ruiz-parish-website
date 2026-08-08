export type ApplicantType = "groom" | "bride";
export interface PersonName {
  first_name: string;
  middle_initial: string;
  last_name: string;
}

export type Spouse = PersonName;

export interface ChurchInformation {
  baptizedIn: string;
  confirmedIn: string;
}

export interface PreviousChurchMarriage {
  churchName: string;
  priest: string;
  churchAddress: string;
}

export interface Sacraments {
  baptized: boolean;
  confirmed: boolean;
  churchMarried: boolean;
  anointedOfTheSick: boolean;
}

export type Participation = "regular" | "sometimes" | "never";

export interface ChurchLife {
  attendsMass: Participation;
  confesses: Participation;
}

export interface Informant extends PersonName {
  relationship: string;
  contactNumber: string;
  dateProvided: Date | null;
}

export interface Person extends PersonName {
  address: string;
  age: number | null;
  contactNumber: string;

  church: ChurchInformation;

  father: PersonName;
  mother: PersonName;

  previousChurchMarriage: PreviousChurchMarriage;
}

export interface Deceased extends PersonName {
  address: string;
  deathCause: string;
  age: number | null;
  birthday: Date | null;

  father: PersonName;
  mother: PersonName;

  spouse: Spouse;
  children: PersonName[];

  sacraments: Sacraments;
  churchLife: ChurchLife;

  characteristics: string;

  informant: Informant;
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

  age: number | null;

  gender: "Male" | "Female";

  address: string;

  contact_number: string | null;
}
