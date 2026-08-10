export type BookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

export type BookingType = "Marriage" | "Funeral" | "Baptism";

export interface Booking {
  id: number;
  date: string; // mm-dd-yyyy for display
  names: string;
  contactNumber: string;
  type: BookingType;
  amount: number;
  status: BookingStatus;
  reference: string;
  details: {
    submittedBy: string;
    packageName: string | null;
    baseAmount: number;
    inclusions: Array<{ name: string; price: number }>;
    addons: Array<{ name: string; price: number }>;
    schedule: {
      date: string | null;
      startTime: string | null;
      endTime: string | null;
    };
    remarks: string | null;
    documents: Array<{ type: string; fileName: string; status: string; url: string }>;
    serviceData: {
      applicants?: Array<{
        role: string;
        name: string;
        age: number;
        address: string;
        contactNumber: string;
        baptizedIn: string;
        confirmedIn: string;
        fatherName: string;
        motherName: string;
        previousMarriage: {
          churchName: string;
          priest: string;
          churchAddress: string;
        };
      }>;
      deceased?: {
        name: string;
        age: number;
        birthDate: string;
        address: string;
        deathCause: string;
        informantName: string;
        informantRelationship: string;
        informantContactNumber: string;
        fatherName: string;
        motherName: string;
        spouseName: string;
        sacraments: Record<string, boolean>;
        children: string[];
      };
      baptizand?: {
        name: string;
        birthDate: string;
        birthPlace: string;
        age: number;
        gender: string;
        address: string;
        contactNumber: string;
        parents: Array<{ relationship: string; name: string; birthPlace: string }>;
        godParents: Array<{ role: string; name: string; residence: string }>;
      };
    };
  };
}
