import DashboardLayout from "../components/DashboardLayout";
import WelcomeBanner from "../components/WelcomeBanner";
import EventsCard from "../components/EventsCard";
import CalendarCard from "../components/CalendarCard";
import AnnouncementCard from "../components/AnnouncementCard";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <WelcomeBanner />

      <div className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
        {/* Left */}
        <EventsCard />

        {/* Right */}
        <div className="space-y-8">
          <CalendarCard />
          <AnnouncementCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
