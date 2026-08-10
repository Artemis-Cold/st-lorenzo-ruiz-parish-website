import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StatsOverview from "../components/dashboard/StatsOverview";
import AnnouncementsCard, {
  type AnnouncementItem,
} from "../components/dashboard/AnnouncementCard";
import RecentActivityCard, {
  type ActivityItem,
} from "../components/dashboard/RecentActivityCard";

// Mock data — replace with a real fetch once the backend exists
const mockAnnouncements: AnnouncementItem[] = [
  { id: 1, title: "Announcement Title", details: "Announcement Details" },
  { id: 2, title: "Announcement Title", details: "Announcement Details" },
];

const mockActivity: ActivityItem[] = [
  {
    id: 1,
    type: "payment",
    title: "Payment",
    details: "Payment Details",
    relativeTime: "2h ago",
  },
  {
    id: 2,
    type: "service",
    title: "Service type",
    details: "Payment Details",
    relativeTime: "3h ago",
  },
  {
    id: 3,
    type: "service",
    title: "Service type",
    details: "Payment Details",
    relativeTime: "5h ago",
  },
  {
    id: 4,
    type: "service",
    title: "Service type",
    details: "Payment Details",
    relativeTime: "1d ago",
  },
  {
    id: 5,
    type: "mass_intention",
    title: "Mass Intention",
    details: "Payment Details",
    relativeTime: "1d ago",
  },
  {
    id: 6,
    type: "document_request",
    title: "Document Request",
    details: "Payment Details",
    relativeTime: "2d ago",
  },
  {
    id: 7,
    type: "special_mass",
    title: "Special Mass",
    details: "Payment Details",
    relativeTime: "3d ago",
  },
];

export default function Dashboard() {
  return (
    <StaffDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        <WelcomeBanner />

        <StatsOverview />

        <div className="grid gap-6 sm:gap-8 xl:grid-cols-[2fr_1fr]">
          <AnnouncementsCard announcements={mockAnnouncements} />
          <RecentActivityCard activity={mockActivity} />
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
