import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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
  const location = useLocation();

  const { user } = useAuth();
  const phoneVerificationOpen =
    location.pathname === "/settings" &&
    new URLSearchParams(location.search).get("verifyPhone") === "1";

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

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {user && !user.phone_verified && (
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ShieldAlert
                  className="mt-0.5 shrink-0 text-amber-700"
                  size={21}
                />
                <div>
                  <p className="font-semibold">Verify your mobile number</p>
                  <p className="mt-0.5 text-sm leading-5 text-amber-800">
                    Booking and payment actions remain unavailable until your
                    number is verified.
                  </p>
                </div>
              </div>
              <Link
                to="/settings?verifyPhone=1"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-950"
              >
                Verify now
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>

      {user && !user.profile_completed && !phoneVerificationOpen && (
        <CompleteProfileModal />
      )}
    </div>
  );
}
