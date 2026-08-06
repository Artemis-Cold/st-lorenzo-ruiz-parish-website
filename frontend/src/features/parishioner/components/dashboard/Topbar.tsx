import { Bell, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="flex h-20 items-center justify-between border-b bg-white px-4 shadow-sm md:px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 transition hover:bg-gray-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="font-serif text-lg font-bold text-[#222] sm:text-2xl lg:text-3xl">
            ST. LORENZO RUIZ PARISH
          </h1>

          <p className="hidden text-sm text-gray-500 sm:block">
            Dagatan, Taysan, Batangas, Philippines
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Notifications */}
        <button className="relative rounded-full bg-gray-100 p-3 transition hover:bg-gray-200">
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <img
            src="https://ui-avatars.com/api/?name=Juan+Dela+Cruz"
            alt="User"
            className="h-10 w-10 rounded-full md:h-11 md:w-11"
          />

          <div className="hidden md:block">
            <p className="font-semibold">{user.full_name}</p>

            <p className="text-sm text-gray-500">Parishioner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
