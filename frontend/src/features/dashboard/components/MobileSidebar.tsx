import {
  CalendarDays,
  CircleHelp,
  Home,
  Info,
  MapPinned,
  User,
  X,
} from "lucide-react";

import logo from "../../../assets/images/parish-logo.png";
import SidebarItem from "./SidebarItem";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-72 flex-col bg-[#B22222] text-white shadow-2xl transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-700 p-6">
          <img
            src={logo}
            alt="Parish Logo"
            className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg"
          />

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-[#981B1B]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          <SidebarItem
            active
            collapsed={false}
            icon={Home}
            label="Dashboard"
            to="/dashboard"
          />

          <SidebarItem
            collapsed={false}
            icon={CalendarDays}
            label="Book Services"
            to="/services"
          />

          <SidebarItem
            collapsed={false}
            icon={MapPinned}
            label="AR Navigation"
            to="/ar"
          />

          <SidebarItem
            collapsed={false}
            icon={User}
            label="My Profile"
            to="/profile"
          />
        </nav>

        {/* Bottom */}
        <div className="space-y-2 border-t border-red-700 p-4">
          <SidebarItem
            collapsed={false}
            icon={CircleHelp}
            label="Help"
            to="/help"
          />

          <SidebarItem
            collapsed={false}
            icon={Info}
            label="About"
            to="/about"
          />
        </div>
      </aside>
    </>
  );
}
