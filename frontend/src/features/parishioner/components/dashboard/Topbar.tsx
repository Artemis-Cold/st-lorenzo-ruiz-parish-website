import { Menu, UserCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
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
        <Link
          to="/profile"
          className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-gray-100"
          aria-label="Open profile"
        >
          {user.profile_photo_url ? (
            <img
              src={user.profile_photo_url}
              alt={user.full_name}
              className="h-10 w-10 rounded-full object-cover md:h-11 md:w-11"
            />
          ) : (
            <UserCircle2 className="h-10 w-10 text-gray-400 md:h-11 md:w-11" />
          )}

          <div className="hidden md:block">
            <p className="font-semibold">{user.full_name}</p>

            <p className="text-sm text-gray-500">Parishioner</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
