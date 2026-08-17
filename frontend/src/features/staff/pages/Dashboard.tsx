import { useEffect, useState } from "react";
import { CalendarRange, ClipboardList, FileText, Hourglass } from "lucide-react";
import { toast } from "sonner";

import { getStaffDashboard, type StaffDashboardData } from "@/services/staffDashboardService";
import AnnouncementsCard from "../components/dashboard/AnnouncementCard";
import RecentActivityCard from "../components/dashboard/RecentActivityCard";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import StatsOverview, { type StatItem } from "../components/dashboard/StatsOverview";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getStaffDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch(() => toast.error("Unable to load dashboard information."))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats: StatItem[] = [
    { label: "Bookings Today", value: dashboard?.stats.bookingsToday ?? 0, icon: CalendarRange, color: "#2F7D5E" },
    { label: "Pending Bookings", value: dashboard?.stats.pendingBookings ?? 0, icon: Hourglass, color: "#C9A227" },
    { label: "Pending Requests", value: dashboard?.stats.pendingDocumentRequests ?? 0, icon: FileText, color: "#2563A8" },
    { label: "Mass Intentions", value: dashboard?.stats.massIntentions ?? 0, icon: ClipboardList, color: "#B22222" },
  ];

  return (
    <StaffDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        <WelcomeBanner />
        <StatsOverview stats={stats} />
        {loading ? (
          <div className="rounded-3xl border border-[#E7E2DA] bg-white py-16 text-center text-sm text-gray-400">
            Loading dashboard...
          </div>
        ) : (
          <div className="grid items-start gap-6 sm:gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <AnnouncementsCard announcements={dashboard?.announcements ?? []} />
            <RecentActivityCard activity={dashboard?.recentActivity ?? []} />
          </div>
        )}
      </div>
    </StaffDashboardLayout>
  );
}
