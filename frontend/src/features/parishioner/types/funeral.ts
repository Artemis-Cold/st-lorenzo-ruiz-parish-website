import type { Deceased } from "./person";

import type { FuneralPackage } from "../data/packages";
import type { TimeSlot } from "../data/timeSlots";

export interface FuneralBooking {
  service: "Funeral";

  date: Date | null;

  timeSlot: TimeSlot | null;

  package: FuneralPackage | null;

  deceased: Deceased;

  remarks: string;

  requirements: {
    deathCertificate: File | null;
    biography: File | null;
  };
}
