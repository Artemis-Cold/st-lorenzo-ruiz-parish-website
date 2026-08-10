import { useState } from "react";

import StaffSidebar from "./StaffSidebar";
import StaffMobileSidebar from "./StaffMobileSidebar";
import StaffTopbar from "./StaffTopbar";

export default function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72">
        <StaffSidebar />
      </div>

      <StaffMobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:pl-72">
        <StaffTopbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
