import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import ProfileHeader from "../components/profile/ProfileHeader";
import CurrentBookings from "../components/profile/CurrentBookings";
import RecentBookings from "../components/profile/RecentBookings";
import Documents from "../components/profile/Documents";
import PersonalInformation from "../components/profile/PersonalInformation";
import BookingDetailModal from "../components/profile/BookingDetailModal";
import ProfilePhotoModal from "../components/profile/ProfilePhotoModal";
import {
  getProfile,
  type ProfileBooking,
  type ProfileDocument,
} from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/types/user";

export default function Profile() {
  const navigate = useNavigate();
  const { user: authenticatedUser, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(authenticatedUser);
  const [bookings, setBookings] = useState<ProfileBooking[]>([]);
  const [recentBookings, setRecentBookings] = useState<ProfileBooking[]>([]);
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
  const [activeTab, setActiveTab] = useState<
    "current" | "recent" | "documents"
  >("current");
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [viewingInformation, setViewingInformation] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );
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
        <div
          aria-label="Loading profile"
          aria-busy="true"
          className="space-y-6"
        >
          <Skeleton className="h-64 rounded-3xl" />
          <div className="grid gap-5 lg:grid-cols-3">
            <Skeleton className="h-72 rounded-3xl lg:col-span-2" />
            <Skeleton className="h-72 rounded-3xl" />
          </div>
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
        onChangePhoto={() => setEditingPhoto(true)}
        onViewInformation={() => setViewingInformation(true)}
        phoneVerified={user.phone_verified}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showAccountActions={false}
      />

      {editingPhoto && (
        <ProfilePhotoModal
          currentPhoto={user.profile_photo_url ?? undefined}
          onSaved={async () => {
            await Promise.all([loadProfile(), refreshUser()]);
          }}
          onClose={() => setEditingPhoto(false)}
        />
      )}

      {viewingInformation && (
        <PersonalInformation
          user={user}
          address={address || "Address not provided"}
          onClose={() => setViewingInformation(false)}
          onEdit={() => {
            setViewingInformation(false);
            navigate("/settings");
          }}
        />
      )}
      <div className="mt-8">
        {activeTab === "current" && (
          <CurrentBookings bookings={bookings} onView={setSelectedBookingId} />
        )}
        {activeTab === "recent" && (
          <RecentBookings
            bookings={recentBookings}
            onView={setSelectedBookingId}
          />
        )}
        {activeTab === "documents" && (
          <Documents documents={documents} onView={setSelectedBookingId} />
        )}
      </div>
      <BookingDetailModal
        key={selectedBookingId ?? "closed-booking-detail"}
        bookingId={selectedBookingId}
        onClose={() => setSelectedBookingId(null)}
        onRescheduled={loadProfile}
      />
    </DashboardLayout>
  );
}
