import { X } from "lucide-react";

import StaffSidebar from "./StaffSidebar";

interface StaffMobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function StaffMobileSidebar({
  open,
  onClose,
}: StaffMobileSidebarProps) {
  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] transform shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-3 z-10 rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        <StaffSidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
