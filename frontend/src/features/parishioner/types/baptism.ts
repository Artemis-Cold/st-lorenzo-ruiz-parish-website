import type { BaptismPackage } from "../data/packages";
import type { TimeSlot } from "../data/timeSlots";
import type { Baptizand } from "./person";

export interface BaptismBooking {
  service: "Baptism";
  date: Date | null;
  timeSlot: TimeSlot | null;

  package: BaptismPackage | null;
  seminarDate: Date | null;

  baptizand: Baptizand;

  requirements: {
    birthCertificate: File | null;
    baptismPermit: File | null;
    noRecordCert: File | null;
  };

  remarks: string;
}
