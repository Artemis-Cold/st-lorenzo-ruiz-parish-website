import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
  active?: boolean;
  collapsed?: boolean;
}

export default function SidebarItem({
  icon: Icon,
  label,
  to,
  active = false,
  collapsed = false,
}: SidebarItemProps) {
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={`group flex rounded-xl px-4 py-3 transition-all duration-300 ${
        collapsed ? "justify-center" : "items-center gap-3"
      } ${
        active
          ? "bg-white text-[#B22222] shadow-md"
          : "text-red-100 hover:bg-[#981B1B]"
      }`}
    >
      <Icon
        size={20}
        className="shrink-0 transition-transform duration-300 group-hover:scale-110"
      />

      <span
        className={`overflow-hidden whitespace-nowrap font-medium transition-all duration-300 ${
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
