export type ApplicantType = "groom" | "bride";
export interface PersonName {
  firstName: string;
  lastName: string;
  middleInitial: string;
}

export type Parent = PersonName;
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

  father: Parent;
  mother: Parent;

  previousChurchMarriage: PreviousChurchMarriage;
}

export interface Deceased extends PersonName {
  address: string;
  deathCause: string;
  age: number | null;
  birthday: Date | null;

  father: Parent;
  mother: Parent;

  spouse: Spouse;
  children: PersonName[];

  sacraments: Sacraments;
  churchLife: ChurchLife;

  characteristics: string;

  informant: Informant;
}


