import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
  collapsed?: boolean;
}

export default function SidebarItem({
  icon: Icon,
  label,
  to,
  collapsed = false,
}: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
          collapsed ? "justify-center" : "gap-3"
        } ${
          isActive
            ? "bg-white text-[#B22222] shadow-md"
            : "text-red-100 hover:bg-[#981B1B]"
        }`
      }
    >
      <Icon size={20} />

      {!collapsed && <span className="font-medium">{label}</span>}
    </NavLink>
  );
}
