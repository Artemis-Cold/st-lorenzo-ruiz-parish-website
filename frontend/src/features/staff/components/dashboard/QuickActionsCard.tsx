import {
  CalendarHeart,
  CalendarRange,
  ClipboardList,
  FileText,
  Megaphone,
  Receipt,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

interface QuickAction {
  label: string;
  description: string;
  to: string;
  icon: LucideIcon;
  color: string;
}

const actions: QuickAction[] = [
  {
    label: "Availability",
    description: "Open booking dates",
    to: "/staff/availability",
    icon: CalendarRange,
    color: "#2F7D5E",
  },
  {
    label: "Events",
    description: "Manage activities",
    to: "/staff/events",
    icon: CalendarHeart,
    color: "#C08A13",
  },
  {
    label: "Announcement",
    description: "Publish an update",
    to: "/staff/announcements",
    icon: Megaphone,
    color: "#B22222",
  },
  {
    label: "Bookings",
    description: "Review sacraments",
    to: "/staff/bookings",
    icon: ClipboardList,
    color: "#7C3AED",
  },
  {
    label: "Payments",
    description: "Verify receipts",
    to: "/staff/transactions",
    icon: Receipt,
    color: "#2563A8",
  },
  {
    label: "Requests",
    description: "Process documents",
    to: "/staff/requests",
    icon: FileText,
    color: "#0F766E",
  },
];

export default function QuickActionsCard() {
  return (
    <section className="rounded-3xl border border-[#E7E2DA] bg-white p-4 shadow-sm sm:p-5">
      <header className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
            <Zap size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-base font-bold text-[#292524]">
              Quick Actions
            </h2>
            <p className="truncate text-[11px] text-gray-500">
              Common staff tasks
            </p>
          </div>
        </div>
        <p className="hidden text-xs text-gray-400 sm:block">
          Jump directly to a management page
        </p>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {actions.map(({ label, description, to, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            title={description}
            className="group flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-[#B22222]/25 hover:bg-red-50/30 hover:shadow-sm"
          >
            <div
              className="grid size-8 shrink-0 place-items-center rounded-xl transition group-hover:scale-105"
              style={{ backgroundColor: `${color}16`, color }}
            >
              <Icon size={16} />
            </div>
            <p className="w-full truncate text-xs font-semibold text-[#292524]">
              {label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
