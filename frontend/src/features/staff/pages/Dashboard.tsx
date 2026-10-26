import { useEffect, useState } from "react";
import { CalendarRange, FileText, Hourglass } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canStaff } from "../permissions";

import { Skeleton } from "@/components/ui/skeleton";
import {
  getStaffDashboard,
  type StaffDashboardData,
} from "@/services/staffDashboardService";
import AnnouncementNotifications from "../components/dashboard/AnnouncementNotifications";
import RecentActivityCard from "../components/dashboard/RecentActivityCard";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import StatsOverview, {
  type StatItem,
} from "../components/dashboard/StatsOverview";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StaffParishCalendar from "../components/dashboard/StaffParishCalendar";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let pending = false;
    const load = () => {
      if (pending) return;
      pending = true;
      getStaffDashboard()
        .then((data) => {
          if (active) {
            setDashboard(data);
            if (canStaff(user, "bookings.manage") && user) {
              const key = `staff-bookings-seen:${user.id}`;
              let seen = 0;
              try {
                seen = Number(localStorage.getItem(key) ?? 0);
              } catch {
                /* Storage may be unavailable. */
              }
              const fresh = (data.newBookings ?? []).filter(
                (item) => item.id > seen,
              );
              if (fresh.length) {
                const newest = fresh[0];
                toast.info(
                  `${fresh.length} new service booking${fresh.length > 1 ? "s" : ""} received today.`,
                  {
                    action: {
                      label: "View booking",
                      onClick: () =>
                        navigate(
                          `/staff/bookings?reference=${encodeURIComponent(newest.reference)}`,
                        ),
                    },
                  },
                );
                try {
                  localStorage.setItem(
                    key,
                    String(Math.max(...fresh.map((item) => item.id))),
                  );
                } catch {
                  /* Notifications still work without persistence. */
                }
              }
            }
          }
        })
        .catch(() => toast.error("Unable to load dashboard information."))
        .finally(() => {
          pending = false;
          if (active) setLoading(false);
        });
    };
    load();
    const timer = window.setInterval(load, 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [user, navigate]);

  const stats: StatItem[] = [
    {
      label: "Submitted Today",
      value: dashboard?.stats.bookingsToday ?? 0,
      icon: CalendarRange,
      color: "#2F7D5E",
    },
    {
      label: "Scheduled Today",
      value: dashboard?.stats.scheduledToday ?? 0,
      icon: CalendarRange,
      color: "#7C3AED",
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
  ];

  return (
    <StaffDashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        <WelcomeBanner />
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22222]">
              At a glance
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-[#292524]">
              Parish activity
            </h2>
          </div>
          <AnnouncementNotifications
            key={user?.id}
            userId={user?.id ?? 0}
            announcements={dashboard?.announcements ?? []}
            loading={loading}
          />
        </div>
        <StatsOverview stats={stats} loading={loading} />

        <section aria-label="Parish overview" className="min-w-0">
          <div className="mb-3 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B22222]">
                Parish overview
              </p>
              <h2 className="mt-0.5 font-serif text-xl font-bold text-[#292524]">
                Schedule and recent activity
              </h2>
            </div>
            <p className="hidden text-xs text-gray-500 sm:block">
              Select a date to view its services and activities.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 xl:h-[440px] xl:grid-cols-12 xl:items-stretch">
            <div className="min-w-0 xl:col-span-7">
              <StaffParishCalendar />
            </div>

            <div className="min-w-0 h-[360px] xl:col-span-5 xl:h-auto">
              {loading ? (
                <DashboardPanelSkeleton />
              ) : (
                <>
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
      {[0].map((item) => (
        <div
          key={item}
          className="flex min-h-52 flex-col rounded-3xl border border-[#E7E2DA] bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <Skeleton className="size-9 rounded-xl bg-gray-100" />
            <Skeleton className="h-5 w-36 rounded-lg bg-gray-100" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-14 rounded-2xl bg-gray-100" />
            <Skeleton className="h-14 rounded-2xl bg-gray-100" />
            <Skeleton className="h-14 rounded-2xl bg-gray-100" />
          </div>
        </div>
      ))}
    </>
  );
}
