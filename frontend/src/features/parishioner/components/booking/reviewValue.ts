import { validationLabel } from "@/utils/validationLabels";

export function reviewValue(value: unknown): string {
  if (value === null || value === undefined || value === "")
    return "Not provided / Hindi ibinigay";
  if (typeof value === "boolean") return value ? "Yes / Oo" : "No / Hindi";
  if (value instanceof Date)
    return Number.isNaN(value.getTime())
      ? "Not provided / Hindi ibinigay"
      : value.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  if (typeof File !== "undefined" && value instanceof File) return value.name;
  if (typeof value === "string") {
    if (!value.trim()) return "Not provided / Hindi ibinigay";
    if (value === "yes" || value === "no")
      return value === "yes" ? "Yes / Oo" : "No / Hindi";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value))
      return reviewValue(new Date(`${value}T00:00:00`));
    if (
      [
        "godfather",
        "godmother",
        "marriage_contract",
        "confirmation_certificate",
        "regular",
        "sometimes",
        "never",
        "father",
        "mother",
      ].includes(value)
    )
      return validationLabel(value.replaceAll("_", " "));
  }
  return String(value);
}
