import api from "@/api/axios";

export interface PublicBookedService {
  serviceCode: "baptism" | "wedding" | "funeral";
  serviceName: string;
  displayName: string;
  startTime: string;
  endTime: string;
  count: number;
}

export interface PublicBookedServiceDay {
  date: string;
  services: PublicBookedService[];
}

export async function getPublicBookedServices(
  month: string,
): Promise<PublicBookedServiceDay[]> {
  const response = await api.get<{ data: PublicBookedServiceDay[] }>(
    "/parish-calendar/bookings",
    { params: { month } },
  );

  return response.data.data;
}
