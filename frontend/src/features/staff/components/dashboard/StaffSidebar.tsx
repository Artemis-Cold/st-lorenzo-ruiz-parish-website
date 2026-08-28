import {
  LayoutGrid,
  Megaphone,
  CalendarHeart,
  ClipboardList,
  CalendarRange,
  FileText,
  Receipt,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import ParishLogo from "@/components/common/ParishLogo";
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
    label: "Events",
    to: "/staff/events",
    icon: CalendarHeart,
    color: "#D4AF37",
  },
  {
    label: "Availability",
    to: "/staff/availability",
    icon: CalendarRange,
    color: "#2F7D5E",
  },
  {
    label: "Booking Management",
    to: "/staff/bookings",
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
    <div className="flex h-full flex-col bg-linear-to-b from-[#B22222] to-[#8F1818] text-white">
      <div className="border-b border-white/10 px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white p-1.5 shadow-lg ring-1 ring-white/30">
            <ParishLogo className="size-full" />
          </span>

          <div className="min-w-0">
            <p className="font-serif text-base font-bold leading-tight">
              St. Lorenzo Ruiz Parish
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Staff portal
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15 text-sm font-bold uppercase ring-1 ring-white/10">
            {user?.first_name?.charAt(0) ?? "S"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {user?.full_name ?? "Parish Staff"}
            </p>
            <p className="truncate text-[11px] text-white/60">
              @{user?.username ?? "admin"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
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

      <div className="border-t border-white/10 px-5 py-3 text-center text-[10px] leading-4 text-white/45">
        St. Lorenzo Ruiz Parish · Dagatan, Taysan
      </div>
    </div>
  );
}
