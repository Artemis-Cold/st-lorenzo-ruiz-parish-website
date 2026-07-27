import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Link } from "react-router-dom";

interface SidebarPopoverItem {
  label: string;
  to: string;
  icon?: LucideIcon;
}

interface SidebarPopoverProps {
  icon: LucideIcon;
  label: string;
  items: SidebarPopoverItem[];
  collapsed?: boolean;
}

export default function SidebarPopover({
  icon: Icon,
  label,
  items,
  collapsed = false,
}: SidebarPopoverProps) {
  return (
    <Popover className="relative">
      <PopoverButton
        className={`group flex w-full items-center rounded-xl px-4 py-3 text-red-100 transition-all duration-300 hover:bg-[#981B1B] ${
          collapsed ? "justify-center" : "gap-3"
        }`}
      >
        <Icon
          size={20}
          className="shrink-0 transition-transform group-hover:scale-110"
        />

        {!collapsed && (
          <>
            <span className="flex-1 text-left font-medium">{label}</span>

            <ChevronRight
              size={18}
              className="transition group-data-open:rotate-90"
            />
          </>
        )}
      </PopoverButton>

      {!collapsed && (
        <PopoverPanel
          anchor="right start"
          className="z-50 ml-3 w-64 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl"
        >
          <div className="space-y-1">
            {items.map((item) => {
              const ItemIcon = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-gray-100 hover:text-[#B22222]"
                >
                  {ItemIcon && <ItemIcon size={18} />}

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </PopoverPanel>
      )}
    </Popover>
  );
}
