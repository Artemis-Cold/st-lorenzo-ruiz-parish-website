export const GCASH_REFERENCE_LENGTH = 13;

export const GCASH_REFERENCE_ERROR =
  "Enter the 13-digit GCash transaction reference number.";

export const normalizeGcashReference = (value: string) =>
  value.replace(/\D/g, "").slice(0, GCASH_REFERENCE_LENGTH);

export const isValidGcashReference = (value: string) =>
  new RegExp(`^\\d{${GCASH_REFERENCE_LENGTH}}$`).test(value);
