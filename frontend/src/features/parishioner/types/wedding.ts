import type { Person } from "./person";
import type { PackageItem } from "../data/packages";
import type { TimeSlot } from "../data/timeSlots";

export interface WeddingBooking {
  service: "Wedding";

  date: Date | null;

  timeSlot: TimeSlot | null;

  package: {
    inclusions: PackageItem[];
    addOns: PackageItem[];
  };

  applicant: {
    groom: Person;
    bride: Person;
  };

  remarks: string;
}
