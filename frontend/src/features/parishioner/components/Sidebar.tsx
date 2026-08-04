import SidebarPopover from "./SidebarPopover";

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
  Church,
  ScrollText,
  Cross,
  FileText,
} from "lucide-react";

import logo from "../../../assets/images/parish-logo.png";

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
      <div className="border-b border-red-700 p-5">
        <div
          className={`flex ${
            collapsed
              ? "flex-col items-center gap-4"
              : "items-center justify-between"
          }`}
        >
          <img
            src={logo}
            alt="Parish Logo"
            className={`rounded-full object-cover transition-all duration-300 ${
              collapsed
                ? "h-15 w-15"
                : "h-25 w-25 border-4 border-white  shadow-lg"
            }`}
          />

          <button
            onClick={onToggle}
            className="rounded-lg p-2 transition hover:bg-[#981B1B]"
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
              label: "Blessing",
              to: "/services/blessing",
              icon: Church,
            },
            {
              label: "Mass Intention",
              to: "/services/mass-intention",
              icon: ScrollText,
            },
            {
              label: "Request Documents",
              to: "/services/documents",
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
      </div>
    </aside>
  );
}
