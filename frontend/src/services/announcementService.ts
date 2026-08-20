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

export async function getPublicAnnouncements(): Promise<Announcement[]> {
  const response = await api.get<{ data: Announcement[] }>("/announcements");
  return response.data.data;
}

export type StaffAnnouncementGroup = "all" | "scheduled" | "past";

export interface StaffAnnouncementPage {
  data: Announcement[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

export async function getStaffAnnouncements(params: {
  group?: StaffAnnouncementGroup;
  search?: string;
  page?: number;
  perPage?: number;
} = {}): Promise<StaffAnnouncementPage> {
  const response = await api.get<StaffAnnouncementPage>(
    "/staff/announcements",
    { params },
  );
  return response.data;
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
