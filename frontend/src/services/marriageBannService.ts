import api from "@/api/axios";

export interface MarriageBann {
  id: number;
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string | null;
  publicationStart: string;
  publicationEnd: string;
  photos: Array<{ url: string }>;
}

export interface StaffMarriageBann {
  id: number;
  publicationStart: string;
  publicationEnd: string;
}

export async function getPublicMarriageBanns(): Promise<MarriageBann[]> {
  const response = await api.get<{ data: MarriageBann[] }>("/marriage-banns");
  return response.data.data;
}

export async function publishMarriageBanns(
  bookingId: number,
  input: { publicationStart: string; publicationEnd: string },
): Promise<StaffMarriageBann> {
  const response = await api.post<{ data: StaffMarriageBann }>(
    `/staff/bookings/${bookingId}/marriage-banns`,
    input,
  );
  return response.data.data;
}

export async function removeMarriageBanns(bookingId: number): Promise<void> {
  await api.delete(`/staff/bookings/${bookingId}/marriage-banns`);
}
