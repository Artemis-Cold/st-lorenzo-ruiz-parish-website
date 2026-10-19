export function validationStep(
  service: string,
  errors: Record<string, string[]>,
  fallback: number,
): number {
  const steps = Object.keys(errors).map((key) => {
    if (service === "mass")
      return key === "intention_date" || key === "mass_event_id"
        ? 1
        : key === "groups"
          ? 2
          : key.startsWith("groups.")
            ? 3
            : ["receipt", "reference_number", "payment_method"].includes(key)
              ? 4
              : fallback;
    if (service === "document")
      return key === "requests"
        ? 1
        : key.startsWith("requests.")
          ? 2
          : ["receipt", "reference_number", "payment_method"].includes(key)
            ? 3
            : fallback;
    if (key === "booking_slot_id" || key === "schedule_request_id") return 2;
    if (key === "service_package_id" || key.startsWith("addons")) return 3;
    if (service === "wedding")
      return key.includes(".preparations.") || key.includes(".church.")
        ? 7
        : key.startsWith("sponsors")
          ? 6
          : key.startsWith("applicant.bride") || key === "account_role"
            ? 4
            : key.startsWith("applicant.groom")
              ? 5
              : fallback;
    if (service === "baptism")
      return key.startsWith("god_parents")
        ? 5
        : key.startsWith("baptizand") || key.startsWith("parents")
          ? 4
          : fallback;
    if (service === "funeral")
      return key.startsWith("deceased.informant")
        ? 6
        : key.startsWith("deceased.sacraments") ||
            key.startsWith("deceased.church_life") ||
            key === "deceased.characteristics"
          ? 5
          : key.startsWith("deceased")
            ? 4
            : fallback;
    return key.startsWith("sponsors")
      ? 5
      : key.startsWith("candidate") || key.startsWith("parents")
        ? service === "first-communion"
          ? 2
          : 4
        : fallback;
  });
  return Math.min(fallback, ...steps);
}
