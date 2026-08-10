import {
  LayoutGrid,
  Megaphone,
  ClipboardList,
  CalendarRange,
  FileText,
  Receipt,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import logo from "../../../../assets/images/parish-logo.png";

import { useAuth } from "@/contexts/AuthContext";
import StaffLogoutButton from "./StaffLogoutButton";

const navItems = [
  {
    label: "Dashboard",
    to: "/staff/dashboard",
    icon: LayoutGrid,
    color: "#B22222",
  },
  {
    label: "Announcements",
    to: "/staff/announcements",
    icon: Megaphone,
    color: "#B22222",
  },
  {
    label: "Availability",
    to: "/staff/availability",
    icon: CalendarRange,
    color: "#2F7D5E",
  },
  {
    label: "Mass Intention Listing",
    to: "/staff/mass-intentions",
    icon: ClipboardList,
    color: "#C9A227",
  },
  {
    label: "Booking Management",
    to: "/staff/bookings",
    icon: CalendarRange,
    color: "#2F7D5E",
  },
  {
    label: "Requests",
    to: "/staff/requests",
    icon: FileText,
    color: "#2F7D5E",
  },
  {
    label: "Transactions",
    to: "/staff/transactions",
    icon: Receipt,
    color: "#2563A8",
  },
  {
    label: "Settings",
    to: "/staff/settings",
    icon: Settings,
    color: "#2563A8",
  },
];

interface StaffSidebarProps {
  onNavigate?: () => void;
}

export default function StaffSidebar({ onNavigate }: StaffSidebarProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col bg-[#B22222] text-white">
      <div className="flex flex-col items-center gap-3 border-b border-white/10 px-6 pb-7 pt-9">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10 text-2xl">
          <img
            src={logo}
            alt="Parish Logo"
            className="rounded-full object-cover transition-all duration-300 h-20 w-20"
          />
        </div>

        <div className="text-center">
          <p className="font-serif text-base font-bold uppercase tracking-wide">
            {user?.full_name ?? "User Name"}
          </p>
          <p className="text-xs text-white/65">{user?.username ?? "admin"}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-[#B22222] shadow-sm"
                  : "text-white/85 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
        <StaffLogoutButton onLogout={onNavigate} />
      </nav>

      <div className="border-t border-white/10 px-6 py-4 text-center text-[11px] text-white/50">
        St. Lorenzo Ruiz Parish — Parish Staff Portal
      </div>
    </div>
  );
}
