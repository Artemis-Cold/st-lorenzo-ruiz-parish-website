export type ApplicantType = "groom" | "bride";
export type WeddingAccountRole = ApplicantType | "representative";

export interface PersonName {
  first_name: string;
  middle_initial: string;
  last_name: string;
}

export interface ChurchInformation {
  baptism_status: "" | "yes" | "no";
  confirmation_status: "" | "yes" | "no";
  baptized_in: string;
  confirmed_in: string;
}

export interface PreviousChurchMarriage {
  church_name: string;
  priest: string;
  church_address: string;
}

export interface Person extends PersonName {
  preparations?: Partial<
    Record<"baptism" | "confirmation", SacramentPreparation>
  >;
  address: string;
  age: number | null;
  contact_number: string;

  church: ChurchInformation;

  father: PersonName;
  mother: PersonName;

  previous_church_marriage: PreviousChurchMarriage;
}

export interface SacramentPreparation {
  candidate: Record<string, string>;
  parents: Array<
    PersonName & { relationship: "father" | "mother"; birth_place: string }
  >;
  sponsors: WeddingSponsor[];
  documents: Array<{ document_type: string; file: File }>;
}

export function emptyPreparation(
  person: Person,
  role: ApplicantType,
  code: "baptism" | "confirmation",
): SacramentPreparation {
  return {
    candidate: {
      first_name: person.first_name,
      middle_initial: person.middle_initial,
      last_name: person.last_name,
      birth_date:
        code === "baptism" || person.church.baptism_status === "no"
          ? (person.preparations?.[
              code === "baptism" ? "confirmation" : "baptism"
            ]?.candidate.birth_date ?? "")
          : "",
      birth_place:
        code === "baptism" || person.church.baptism_status === "no"
          ? (person.preparations?.[
              code === "baptism" ? "confirmation" : "baptism"
            ]?.candidate.birth_place ?? "")
          : "",
      gender: role === "bride" ? "Female" : "Male",
      address: person.address,
      contact_number: person.contact_number,
      parish_origin: "",
      baptism_date: "",
      baptism_church: person.church.baptized_in,
    },
    parents: (["father", "mother"] as const).map((relationship) => ({
      ...person[relationship],
      relationship,
      birth_place:
        code === "baptism" || person.church.baptism_status === "no"
          ? (person.preparations?.[
              code === "baptism" ? "confirmation" : "baptism"
            ]?.parents.find((parent) => parent.relationship === relationship)
              ?.birth_place ?? "")
          : "",
    })),
    sponsors: Array.from({ length: code === "baptism" ? 2 : 1 }, () => ({
      role: "",
      first_name: "",
      middle_initial: "",
      last_name: "",
      residence: "",
      requirement_type: "",
      requirement_file: null,
    })),
    documents: [],
  };
}

/** Sync changed birth details for this applicant and their parents only. */
export function updatePreparation(
  person: Person,
  code: "baptism" | "confirmation",
  next: SacramentPreparation,
): Person {
  const otherCode = code === "baptism" ? "confirmation" : "baptism";
  const other = person.preparations?.[otherCode];
  const changedBirthDetails = Object.fromEntries(
    (["birth_date", "birth_place"] as const)
      .filter(
        (field) =>
          person.preparations?.[code]?.candidate[field] !==
          next.candidate[field],
      )
      .map((field) => [field, next.candidate[field]]),
  );
  const changedParentBirthplaces = new Map(
    next.parents
      .filter(
        (parent) =>
          person.preparations?.[code]?.parents.find(
            (previous) => previous.relationship === parent.relationship,
          )?.birth_place !== parent.birth_place,
      )
      .map((parent) => [parent.relationship, parent.birth_place]),
  );
  const sync =
    person.church.baptism_status === "no" &&
    person.church.confirmation_status === "no" &&
    other &&
    (Object.keys(changedBirthDetails).length > 0 ||
      changedParentBirthplaces.size > 0);
  return {
    ...person,
    preparations: {
      ...person.preparations,
      [code]: next,
      ...(sync
        ? {
            [otherCode]: {
              ...other,
              candidate: {
                ...other.candidate,
                ...changedBirthDetails,
              },
              parents: other.parents.map((parent) =>
                changedParentBirthplaces.has(parent.relationship)
                  ? {
                      ...parent,
                      birth_place: changedParentBirthplaces.get(
                        parent.relationship,
                      )!,
                    }
                  : parent,
              ),
            },
          }
        : {}),
    },
  };
}

export interface WeddingDocument {
  document_type:
    | "marriage_license"
    | "cenomar"
    | "baptismal_certificate"
    | "confirmation_certificate"
    | "bride_baptismal_certificate"
    | "groom_baptismal_certificate"
    | "bride_confirmation_certificate"
    | "groom_confirmation_certificate"
    | "couple_photo_1"
    | "couple_photo_2"
    | "couple_photo_3";

  file: File;
}

export interface WeddingSponsor extends PersonName {
  role: "" | "godfather" | "godmother";
  residence: string;
  requirement_type: "" | "marriage_contract" | "confirmation_certificate";
  requirement_file: File | null;
}

export interface WeddingBooking {
  booking_slot_id: number;

  service_package_id: number;

  selected_addon_ids: number[];

  applicant: {
    groom: Person;
    bride: Person;
  };

  sponsors: WeddingSponsor[];

  documents: WeddingDocument[];

  remarks: string;
}
