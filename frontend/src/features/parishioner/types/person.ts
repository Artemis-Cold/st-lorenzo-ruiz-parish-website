export type ApplicantType = "groom" | "bride";
export interface PersonName {
  firstName: string;
  lastName: string;
  middleInitial: string;
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
  birthPlace: string;
}

export interface GodParent extends PersonName {
  residence: string;
}

export interface GodParentPair {
  godFather: GodParent;
  godMother: GodParent;

  requirements: {
    marriageContract: File | null;
    confirmationCertificate: File | null;
  };
}

export interface Baptizand extends PersonName {
  birthDate: Date | null;
  birthPlace: string;

  age: number | null;
  gender: string;

  father: Parent;
  mother: Parent;

  address: string;

  contactNumber: string;

  godParents: GodParentPair[];
}
