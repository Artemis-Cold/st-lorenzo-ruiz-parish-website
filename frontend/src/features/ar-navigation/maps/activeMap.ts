import { mapProfiles } from "./index";

// Change only this line to switch navigation and staff marker printing.
export const ACTIVE_MAP: "parish" | "house" = "parish";
export const activeMap = mapProfiles.find(
  (profile) => profile.id === ACTIVE_MAP,
)!;
