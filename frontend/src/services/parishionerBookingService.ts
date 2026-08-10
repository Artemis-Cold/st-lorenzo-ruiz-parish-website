import api from "@/api/axios";
import type { ProfileBooking } from "@/api/auth";

export interface ParishionerBookingDetail {
  id: number;
  reference: string;
  service: string;
  serviceCode: string;
  status: ProfileBooking["status"];
  submittedAt: string;
  remarks: string | null;
  schedule: { date: string | null; startTime: string | null; endTime: string | null };
  package: {
    name: string;
    baseAmount: number;
    inclusions: string[];
    addons: Array<{ name: string; price: number }>;
    totalAmount: number;
  } | null;
  sections: Array<{
    title: string;
    fields: Array<{ label: string; value: string }>;
  }>;
  documents: Array<{
    type: string;
    fileName: string;
    status: string;
    url: string;
  }>;
}

export async function getParishionerBooking(id: number) {
  const response = await api.get<{ data: ParishionerBookingDetail }>(
    `/bookings/${id}`,
  );
  return response.data.data;
}
