import { useEffect, useState } from "react";
import {
  CalendarRange,
  ClipboardList,
  FileText,
  Hourglass,
} from "lucide-react";
import { toast } from "sonner";

import {
  getStaffDashboard,
  type StaffDashboardData,
} from "@/services/staffDashboardService";
import AnnouncementsCard from "../components/dashboard/AnnouncementCard";
import RecentActivityCard from "../components/dashboard/RecentActivityCard";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import StatsOverview, {
  type StatItem,
} from "../components/dashboard/StatsOverview";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StaffParishCalendar from "../components/dashboard/StaffParishCalendar";
import QuickActionsCard from "../components/dashboard/QuickActionsCard";

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
    {
      label: "Bookings Today",
      value: dashboard?.stats.bookingsToday ?? 0,
      icon: CalendarRange,
      color: "#2F7D5E",
    },
    {
      label: "Pending Bookings",
      value: dashboard?.stats.pendingBookings ?? 0,
      icon: Hourglass,
      color: "#C9A227",
    },
    {
      label: "Pending Requests",
      value: dashboard?.stats.pendingDocumentRequests ?? 0,
      icon: FileText,
      color: "#2563A8",
    },
    {
      label: "Mass Intentions",
      value: dashboard?.stats.massIntentions ?? 0,
      icon: ClipboardList,
      color: "#B22222",
    },
  ];

  return (
    <StaffDashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        <WelcomeBanner />
        <StatsOverview stats={stats} />

        <QuickActionsCard />

        <section aria-label="Parish overview" className="min-w-0">
          <div className="mb-3 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B22222]">
                Parish overview
              </p>
              <h2 className="mt-0.5 font-serif text-xl font-bold text-[#292524]">
                Schedule and updates
              </h2>
            </div>
            <p className="hidden text-xs text-gray-500 sm:block">
              Select a date to view its services and activities.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 xl:h-[400px] xl:grid-cols-12 xl:items-stretch">
            <div className="min-w-0 xl:col-span-5">
              <StaffParishCalendar />
            </div>

            <div className="grid min-w-0 gap-5 sm:h-[320px] sm:grid-cols-2 xl:col-span-7 xl:h-auto">
              {loading ? (
                <DashboardPanelSkeleton />
              ) : (
                <>
                  <AnnouncementsCard
                    announcements={dashboard?.announcements ?? []}
                  />
                  <RecentActivityCard
                    activity={dashboard?.recentActivity ?? []}
                  />
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </StaffDashboardLayout>
  );
}

function DashboardPanelSkeleton() {
  return (
    <>
      {[0, 1].map((item) => (
        <div
          key={item}
          className="flex min-h-52 animate-pulse flex-col rounded-3xl border border-[#E7E2DA] bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gray-100" />
            <div className="h-5 w-36 rounded-lg bg-gray-100" />
          </div>
          <div className="space-y-3">
            <div className="h-14 rounded-2xl bg-gray-100" />
            <div className="h-14 rounded-2xl bg-gray-100" />
            <div className="h-14 rounded-2xl bg-gray-100" />
          </div>
        </div>
      ))}
    </>
  );
}
