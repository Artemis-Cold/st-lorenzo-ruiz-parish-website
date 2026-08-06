import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;

  to?: string;
  onClick?: () => void;
}

export default function SidebarItem({
  icon: Icon,
  label,
  to,
  onClick,
  collapsed = false,
}: SidebarItemProps) {
  const className = ({
    isActive = false,
  }: {
    isActive?: boolean;
  }) =>
    `flex w-full items-center rounded-xl px-4 py-3 transition-all duration-200 ${
      collapsed ? "justify-center" : "gap-3"
    } ${
      isActive
        ? "bg-white text-[#B22222] shadow-md"
        : "text-red-100 hover:bg-[#981B1B]"
    }`;

  if (to) {
    return (
      <NavLink to={to} className={className}>
        <Icon size={20} />

        {!collapsed && (
          <span className="font-medium">{label}</span>
        )}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className({})}
    >
      <Icon size={20} />

      {!collapsed && (
        <span className="font-medium">{label}</span>
      )}
    </button>
  );
}