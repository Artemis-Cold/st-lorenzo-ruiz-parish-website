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
    <header className="flex h-16 items-center justify-between border-b bg-white px-3 shadow-sm sm:h-18 sm:px-4 md:px-6 lg:h-20 lg:px-8">
      {/* Left */}
      <div className="min-w-0 flex items-center gap-2 sm:gap-3 lg:gap-4">
        {/* Mobile Hamburger */}
        <button
          onClick={onMenuClick}
          className="shrink-0 rounded-lg p-2 transition hover:bg-gray-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate font-serif text-sm font-bold text-[#222] sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">
            ST. LORENZO RUIZ PARISH
          </h1>

          <p className="hidden truncate text-xs text-gray-500 sm:block lg:text-sm">
            Dagatan, Taysan, Batangas, Philippines
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="ml-2 flex shrink-0 items-center gap-3 md:gap-5">
        <Link
          to="/profile"
          className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-gray-100"
          aria-label="Open profile"
        >
          {user.profile_photo_url ? (
            <img
              src={user.profile_photo_url}
              alt={user.full_name}
              className="size-9 rounded-full object-cover md:size-10 lg:size-11"
            />
          ) : (
            <UserCircle2 className="size-9 text-gray-400 md:size-10 lg:size-11" />
          )}

          <div className="hidden md:block">
            <p className="max-w-40 truncate text-sm font-semibold lg:text-base">{user.full_name}</p>

            <p className="text-xs text-gray-500 lg:text-sm">Parishioner</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
