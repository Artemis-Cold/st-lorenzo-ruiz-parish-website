import { CalendarRange, FileText, ClipboardList } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export interface StatItem {
  label: string;
  value: number;
  icon: typeof CalendarRange;
  color: string;
}

const defaultStats: StatItem[] = [
  { label: "Bookings Today", value: 0, icon: CalendarRange, color: "#2F7D5E" },
  { label: "Pending Requests", value: 0, icon: FileText, color: "#2F7D5E" },
  {
    label: "Pending Bookings",
    value: 0,
    icon: CalendarRange,
    color: "#2563A8",
  },
  { label: "Mass Intentions", value: 0, icon: ClipboardList, color: "#C9A227" },
];

interface Props {
  stats?: StatItem[];
  loading?: boolean;
}

export default function StatsOverview({
  stats = defaultStats,
  loading = false,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-2xl border border-[#E7E2DA] bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div
            className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}1A`, color }}
          >
            <Icon size={18} />
          </div>

          {loading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="font-serif text-2xl font-bold tabular-nums text-[#292524]">
              {value}
            </p>
          )}
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
