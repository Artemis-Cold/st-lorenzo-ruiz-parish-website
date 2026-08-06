import DashboardLayout from "../components/DashboardLayout";

import ProfileHeader from "../components/profile/ProfileHeader";
import CurrentBookings from "../components/profile/CurrentBookings";
import PersonalInformation from "../components/profile/PersonalInformation";
import HelpCard from "../components/profile/HelpCard";

export default function Profile() {
  return (
    <DashboardLayout>
      <ProfileHeader />

      <div className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
        {/* Left */}
        <CurrentBookings />

        {/* Right */}
        <div className="space-y-8">
          <PersonalInformation />
          <HelpCard />
        </div>
      </div>
    </DashboardLayout>
  );
}