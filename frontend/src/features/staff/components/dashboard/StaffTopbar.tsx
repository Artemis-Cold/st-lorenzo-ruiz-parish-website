import { Menu, Bell } from "lucide-react";

interface StaffTopbarProps {
  onMenuClick: () => void;
}

export default function StaffTopbar({ onMenuClick }: StaffTopbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-[#E7E2DA] bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-lg p-2 text-[#B22222] hover:bg-[#B22222]/10"
      >
        <Menu size={22} />
      </button>

      <span className="font-serif text-sm font-bold uppercase tracking-wide text-[#B22222]">
        Parish Staff Portal
      </span>

      <button
        aria-label="Notifications"
        className="rounded-lg p-2 text-[#B22222] hover:bg-[#B22222]/10"
      >
        <Bell size={20} />
      </button>
    </header>
  );
}
