import api from "@/api/axios";

export interface Announcement {
  id: number;
  title: string;
  details: string;
  postedAt: string;
  status: "published" | "scheduled";
  createdBy: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementInput {
  title: string;
  details: string;
  postedAt: string;
}

interface AnnouncementResponse {
  data: Announcement;
}

export async function getStaffAnnouncements(): Promise<Announcement[]> {
  const response = await api.get<{ data: Announcement[] }>(
    "/staff/announcements",
  );
  return response.data.data;
}

export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<Announcement> {
  const response = await api.post<AnnouncementResponse>(
    "/staff/announcements",
    input,
  );
  return response.data.data;
}

export async function updateAnnouncement(
  id: number,
  input: AnnouncementInput,
): Promise<Announcement> {
  const response = await api.put<AnnouncementResponse>(
    `/staff/announcements/${id}`,
    input,
  );
  return response.data.data;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await api.delete(`/staff/announcements/${id}`);
}
