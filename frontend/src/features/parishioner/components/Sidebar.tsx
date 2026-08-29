import SidebarPopover from "./SidebarPopover";
import LogoutButton from "./LogoutButton";
import {
  CalendarDays,
  CircleHelp,
  Home,
  Info,
  MapPinned,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Baby,
  HeartHandshake,
  ScrollText,
  Cross,
  FileText,
  Settings,
} from "lucide-react";

import ParishLogo from "@/components/common/ParishLogo";
import SidebarItem from "./SidebarItem";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 hidden h-screen bg-[#B22222] text-white shadow-xl transition-all duration-300 lg:flex lg:flex-col ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Logo + Toggle */}
      <div
        className={`relative border-b border-white/10 p-5 ${collapsed ? "pb-8" : ""}`}
      >
        <div className="flex justify-center">
          <span
            className={`grid shrink-0 place-items-center rounded-full bg-white shadow-lg ring-1 ring-white/30 transition-all duration-300 ${collapsed ? "size-12 p-1" : "size-20 p-1.5"}`}
          >
            <ParishLogo className="size-full" />
          </span>

          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`rounded-lg p-2 transition hover:bg-[#981B1B] ${collapsed ? "absolute bottom-1 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#B22222]" : "absolute right-4 top-1/2 -translate-y-1/2"}`}
          >
            {collapsed ? (
              <PanelLeftOpen size={22} />
            ) : (
              <PanelLeftClose size={22} />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        <SidebarItem
          collapsed={collapsed}
          icon={Home}
          label="Dashboard"
          to="/dashboard"
        />

        <SidebarPopover
          collapsed={collapsed}
          icon={CalendarDays}
          label="Services"
          items={[
            {
              label: "Baptism",
              to: "/services/baptism",
              icon: Baby,
            },
            {
              label: "Wedding",
              to: "/services/wedding",
              icon: HeartHandshake,
            },
            {
              label: "Funeral",
              to: "/services/funeral",
              icon: Cross,
            },
            {
              label: "Mass Intention",
              to: "/services/mass-intention",
              icon: ScrollText,
            },
            {
              label: "Request Documents",
              to: "/services/document-request",
              icon: FileText,
            },
          ]}
        />

        <SidebarItem
          collapsed={collapsed}
          icon={MapPinned}
          label="AR Navigation"
          to="/ar-navigation"
        />

        <SidebarItem
          collapsed={collapsed}
          icon={User}
          label="My Profile"
          to="/profile"
        />
        <SidebarItem
          collapsed={collapsed}
          icon={Settings}
          label="Settings"
          to="/settings"
        />
      </nav>

      {/* Bottom */}
      <div className="space-y-2 border-t border-red-700 p-4">
        <SidebarItem
          collapsed={collapsed}
          icon={CircleHelp}
          label="Help"
          to="/help"
        />

        <SidebarItem
          collapsed={collapsed}
          icon={Info}
          label="About"
          to="/about"
        />

        <LogoutButton collapsed={collapsed} />
      </div>
    </aside>
  );
}
