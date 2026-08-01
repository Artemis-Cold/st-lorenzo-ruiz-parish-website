export interface PersonName {
  firstName: string;
  lastName: string;
  middleInitial: string;
}

export type Parent = PersonName;

export interface ChurchInformation {
  baptizedIn: string;
  confirmedIn: string;
}

export interface PreviousChurchMarriage {
  churchName: string;
  priest: string;
  churchAddress: string;
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

