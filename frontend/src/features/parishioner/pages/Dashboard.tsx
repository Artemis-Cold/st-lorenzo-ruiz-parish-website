import { useEffect, useState } from "react";

import { getProfile, type ProfileBooking } from "@/api/auth";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "../components/DashboardLayout";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import EventsCard from "../components/dashboard/EventsCard";
import CalendarCard from "../components/dashboard/CalendarCard";
import BookingUpdatesNotification from "../components/dashboard/BookingUpdatesNotification";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPublicAnnouncements,
  type Announcement,
} from "@/services/announcementService";

export default function Dashboard() {
  const { user } = useAuth();
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

      {!loading && !error && user && (
        <BookingUpdatesNotification
          key={user.id}
          bookings={bookings}
          userId={user.id}
        />
      )}

      <div className="mt-8 grid items-start gap-8 xl:grid-cols-[2fr_1fr]">
        {loading ? (
          <Skeleton className="min-h-80 rounded-3xl bg-white shadow-lg" />
        ) : (
          <EventsCard announcements={announcements} />
        )}

        <div>
          {loading ? (
            <Skeleton className="h-96 rounded-3xl bg-white shadow-lg" />
          ) : (
            <CalendarCard bookings={bookings} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
