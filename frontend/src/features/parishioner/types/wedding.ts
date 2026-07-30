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
    groom: {
      firstName: string;
      lastName: string;
    };

    bride: {
      firstName: string;
      lastName: string;
    };
  };

  remarks: string;
}
