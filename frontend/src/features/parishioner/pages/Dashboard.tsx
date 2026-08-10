import { useEffect, useState } from "react";

import { getProfile, type ProfileBooking } from "@/api/auth";
import DashboardLayout from "../components/DashboardLayout";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import EventsCard from "../components/dashboard/EventsCard";
import CalendarCard from "../components/dashboard/CalendarCard";
import AnnouncementCard from "../components/dashboard/AnnouncementCard";
import { getPublicAnnouncements, type Announcement } from "@/services/announcementService";

export default function Dashboard() {
  const [bookings, setBookings] = useState<ProfileBooking[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProfile(), getPublicAnnouncements()])
      .then(([profile, publicAnnouncements]) => {
        setBookings(profile.current_bookings);
        setAnnouncements(publicAnnouncements);
      })
      .catch(() => setError("Unable to load your dashboard information."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <WelcomeBanner />

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
        {loading ? (
          <div className="min-h-80 animate-pulse rounded-3xl bg-white shadow-lg" />
        ) : (
          <EventsCard announcements={announcements} />
        )}

        <div className="space-y-8">
          {loading ? (
            <>
              <div className="h-96 animate-pulse rounded-3xl bg-white shadow-lg" />
              <div className="h-48 animate-pulse rounded-3xl bg-white shadow-lg" />
            </>
          ) : (
            <>
              <CalendarCard bookings={bookings} />
              <AnnouncementCard bookings={bookings} />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
