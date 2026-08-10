import api from "@/api/axios";
import type { AnnouncementItem } from "@/features/staff/components/dashboard/AnnouncementCard";
import type { ActivityItem } from "@/features/staff/components/dashboard/RecentActivityCard";

export interface StaffDashboardData {
  stats: {
    bookingsToday: number;
    pendingBookings: number;
    pendingDocumentRequests: number;
    massIntentions: number;
  };
  announcements: AnnouncementItem[];
  recentActivity: ActivityItem[];
}

export async function getStaffDashboard(): Promise<StaffDashboardData> {
  const response = await api.get<{ data: StaffDashboardData }>(
    "/staff/dashboard",
  );
  return response.data.data;
}
