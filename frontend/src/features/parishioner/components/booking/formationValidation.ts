import type { FormationSacramentBooking } from "../../types/formationSacrament";

export function validateFormation(
  booking: FormationSacramentBooking,
  section: string,
  today = new Date().toLocaleDateString("en-CA"),
) {
  const errors: Record<string, string[]> = {};
  const required = (key: string, value: string, label: string) => {
    if (!value.trim()) errors[key] = [`${label} is required.`];
  };
  if (section === "Applicant Details") {
    const labels = {
      first_name: "First Name",
      last_name: "Last Name",
      parish_origin: "Parish of Origin",
      baptism_date: "Date of Baptism",
      baptism_church: "Baptized In",
      birth_date: "Birthday",
      birth_place: "Place of Birth",
      gender: "Gender",
      address: "Address",
      contact_number: "Contact Number",
    };
    for (const [key, label] of Object.entries(labels))
      required(
        `candidate.${key}`,
        booking.candidate[key as keyof typeof booking.candidate],
        label,
      );
    const candidate = booking.candidate;
    if (candidate.contact_number && !/^09\d{9}$/.test(candidate.contact_number))
      errors["candidate.contact_number"] = [
        "Contact Number must contain 11 digits beginning with 09.",
      ];
    for (const key of ["birth_date", "baptism_date"] as const) {
      if (
        candidate[key] &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(candidate[key]) ||
          !Number.isFinite(Date.parse(candidate[key])) ||
          candidate[key] > today)
      )
        errors[`candidate.${key}`] = [
          `${labels[key]} must be a valid date that is not in the future.`,
        ];
    }
    if (
      candidate.baptism_date &&
      candidate.birth_date &&
      candidate.baptism_date < candidate.birth_date
    )
      errors["candidate.baptism_date"] = [
        "Date of Baptism cannot be before Birthday.",
      ];
    booking.parents.forEach((parent, index) => {
      for (const [key, label] of Object.entries({
        first_name: "First Name",
        last_name: "Last Name",
        birth_place: "Place of Birth",
      }))
        required(
          `parents.${index}.${key}`,
          parent[key as keyof typeof parent],
          `${parent.relationship === "father" ? "Father" : "Mother"} — ${label}`,
        );
    });
  }
  if (section === "Sponsors") {
    if (!booking.sponsors.length)
      errors.sponsors = ["Add at least one sponsor."];
    booking.sponsors.forEach((sponsor, index) => {
      for (const [key, label] of Object.entries({
        role: "Role",
        first_name: "First Name",
        last_name: "Last Name",
        address: "Address",
        requirement_type: "Certificate to Submit",
      }))
        required(
          `sponsors.${index}.${key}`,
          String(sponsor[key as keyof typeof sponsor] ?? ""),
          `Sponsor ${index + 1} — ${label}`,
        );
    });
  }
  return errors;
}
