import {
  Bell,
  CircleDollarSign,
  CalendarRange,
  ClipboardList,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type ActivityType =
  | "payment"
  | "service"
  | "mass_intention"
  | "document_request"
  | "special_mass";

export interface ActivityItem {
  id: number;
  type: ActivityType;
  title: string;
  details: string;
  relativeTime: string;
}

const iconMap: Record<ActivityType, { icon: LucideIcon; color: string }> = {
  payment: { icon: CircleDollarSign, color: "#2563A8" },
  service: { icon: CalendarRange, color: "#C9A227" },
  mass_intention: { icon: ClipboardList, color: "#2F7D5E" },
  document_request: { icon: FileText, color: "#2F7D5E" },
  special_mass: { icon: FileText, color: "#2F7D5E" },
};

interface Props {
  activity: ActivityItem[];
}

export default function RecentActivityCard({ activity }: Props) {
  return (
    <div className="rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-sm sm:p-7">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B22222]/10 text-[#B22222]">
          <Bell size={18} />
        </div>
        <h2 className="font-serif text-lg font-bold text-[#292524] sm:text-xl">
          Recent Activity
        </h2>
      </div>

      {activity.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E7E2DA] py-14 text-center">
          <Bell className="mx-auto mb-3 text-gray-300" size={28} />
          <p className="text-sm text-gray-400">Nothing to show yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#F0EDE7]">
          {activity.map((item) => {
            const { icon: Icon, color } = iconMap[item.type];

            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${color}1A`, color }}
                  >
                    <Icon size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#292524]">
                      {item.title}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {item.details}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-xs tabular-nums text-gray-400">
                  {item.relativeTime}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
