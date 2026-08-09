import { useState } from "react";

import MobileSidebar from "./MobileSidebar";
import Sidebar from "./Sidebar";
import Topbar from "./dashboard/Topbar";
import CompleteProfileModal from "./CompleteProfileModal";

import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user } = useAuth();

  return (
    <div
      className={`flex flex-1 flex-col transition-all duration-300 ${
        collapsed ? "lg:ml-20" : "lg:ml-72"
      }`}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      {user && !user.profile_completed && <CompleteProfileModal />}
    </div>
  );
}