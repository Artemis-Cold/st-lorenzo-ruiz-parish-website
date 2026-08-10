import { useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import ProfileHeader from "../components/profile/ProfileHeader";
import CurrentBookings from "../components/profile/CurrentBookings";
import RecentBookings from "../components/profile/RecentBookings";
import Documents from "../components/profile/Documents";
import PersonalInformation from "../components/profile/PersonalInformation";
import ProfileEditForm from "../components/profile/ProfileEditForm";
import HelpCard from "../components/profile/HelpCard";
import BookingDetailModal from "../components/profile/BookingDetailModal";
import {
  getProfile,
  type ProfileBooking,
  type ProfileDocument,
} from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types/user";

export default function Profile() {
  const { user: authenticatedUser, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(authenticatedUser);
  const [bookings, setBookings] = useState<ProfileBooking[]>([]);
  const [recentBookings, setRecentBookings] = useState<ProfileBooking[]>([]);
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
  const [activeTab, setActiveTab] = useState<
    "current" | "recent" | "documents"
  >("current");
  const [editing, setEditing] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setError(null);
      const response = await getProfile();
      setUser(response.user);
      setBookings(response.current_bookings);
      setRecentBookings(response.recent_bookings);
      setDocuments(response.documents);
    } catch {
      setError("Unable to load your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile()
      .then((response) => {
        setUser(response.user);
        setBookings(response.current_bookings);
        setRecentBookings(response.recent_bookings);
        setDocuments(response.documents);
      })
      .catch(() => {
        setError("Unable to load your profile. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          Loading profile...
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error ?? "Profile information is unavailable."}
        </div>
      </DashboardLayout>
    );
  }

  const address = [
    user.address.house_no,
    user.address.street,
    user.address.barangay,
    user.address.municipality,
    user.address.province,
    user.address.zip_code,
  ]
    .filter(Boolean)
    .join(", ");

  const saved = async () => {
    await Promise.all([loadProfile(), refreshUser()]);
    setEditing(false);
  };

  return (
    <DashboardLayout>
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <ProfileHeader
        fullName={user.full_name}
        phone={user.phone}
        username={user.username}
        address={address || "Address not provided"}
        avatar={user.profile_photo_url ?? undefined}
        onEdit={() => setEditing(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {editing && (
        <div className="mt-8">
          <ProfileEditForm
            user={user}
            onSaved={saved}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
        {activeTab === "current" && <CurrentBookings bookings={bookings} onView={setSelectedBookingId} />}
        {activeTab === "recent" && (
          <RecentBookings bookings={recentBookings} onView={setSelectedBookingId} />
        )}
        {activeTab === "documents" && <Documents documents={documents} onView={setSelectedBookingId} />}

        <div className="space-y-8">
          <PersonalInformation
            fullName={user.full_name}
            phone={user.phone}
            username={user.username}
            address={address || "Address not provided"}
            onEdit={() => setEditing(true)}
          />
          <HelpCard />
        </div>
      </div>
      <BookingDetailModal bookingId={selectedBookingId} onClose={() => setSelectedBookingId(null)} />
    </DashboardLayout>
  );
}
