import { useState } from "react";
import LogoutButton from "./LogoutButton";

import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Cross,
  HeartHandshake,
  Home,
  Info,
  MapPinned,
  ScrollText,
  User,
  X,
  FileText,
  Settings,
} from "lucide-react";

import ParishLogo from "@/components/common/ParishLogo";
import SidebarItem from "./SidebarItem";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const [serviceOpen, setServiceOpen] = useState(false);

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
        <div className="relative flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <span className="grid size-15 shrink-0 place-items-center rounded-full bg-white p-1.5 shadow-lg ring-1 ring-white/30">
            <ParishLogo className="size-full" />
          </span>
          <div className="min-w-0 pr-10">
            <p className="font-serif text-sm font-bold leading-tight">
              St. Lorenzo Ruiz Parish
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
              Parishioner portal
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 transition hover:bg-[#981B1B]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          <SidebarItem
            collapsed={false}
            icon={Home}
            label="Dashboard"
            to="/dashboard"
          />

          <div className="rounded-xl">
            <button
              onClick={() => setServiceOpen(!serviceOpen)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-red-100 transition hover:bg-[#981B1B]"
            >
              <div className="flex items-center gap-3">
                <CalendarDays size={20} />
                <span className="font-medium">Book Services</span>
              </div>

              {serviceOpen ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>

            {serviceOpen && (
              <div className="mt-2 ml-6 space-y-1 border-l border-red-600 pl-4">
                <SidebarItem
                  collapsed={false}
                  icon={User}
                  label="Baptism"
                  to="/services/baptism"
                />

                <SidebarItem
                  collapsed={false}
                  icon={HeartHandshake}
                  label="Wedding"
                  to="/services/wedding"
                />

                <SidebarItem
                  collapsed={false}
                  icon={Cross}
                  label="Funeral"
                  to="/services/funeral"
                />

                <SidebarItem
                  collapsed={false}
                  icon={ScrollText}
                  label="Mass Intention"
                  to="/services/mass-intention"
                />

                <SidebarItem
                  collapsed={false}
                  icon={FileText}
                  label="Request Documents"
                  to="/services/document-request"
                />
              </div>
            )}
          </div>

          <SidebarItem
            collapsed={false}
            icon={MapPinned}
            label="AR Navigation"
            to="/ar-navigation"
          />

          <SidebarItem
            collapsed={false}
            icon={User}
            label="My Profile"
            to="/profile"
          />
          <SidebarItem
            collapsed={false}
            icon={Settings}
            label="Settings"
            to="/settings"
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

          <LogoutButton collapsed={false} />
        </div>
      </aside>
    </>
  );
}
