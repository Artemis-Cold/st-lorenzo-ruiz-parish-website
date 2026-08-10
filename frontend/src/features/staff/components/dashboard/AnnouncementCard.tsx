import { Megaphone, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface AnnouncementItem {
  id: number;
  title: string;
  details: string;
}

interface Props {
  announcements: AnnouncementItem[];
}

export default function AnnouncementCard({ announcements }: Props) {
  return (
    <div className="rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-sm sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B22222]/10 text-[#B22222]">
            <Megaphone size={18} />
          </div>
          <h2 className="font-serif text-lg font-bold text-[#292524] sm:text-xl">
            Recent Announcements
          </h2>
        </div>

        <Link
          to="/staff/announcements"
          className="text-sm font-medium text-[#B22222] hover:underline"
        >
          View all
        </Link>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E7E2DA] py-14 text-center">
          <Megaphone className="mx-auto mb-3 text-gray-300" size={28} />
          <p className="text-sm text-gray-400">No announcements posted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => (
            <Link
              key={item.id}
              to="/staff/announcements"
              className="group flex w-full items-center gap-4 rounded-2xl border border-[#E7E2DA] p-4 text-left transition hover:border-[#B22222]/30 hover:bg-[#B22222]/[0.03]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#B22222] text-white">
                <Megaphone size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-[#292524]">
                  {item.title}
                </h3>
                <p className="truncate text-sm text-gray-500">{item.details}</p>
              </div>

              <ChevronRight
                size={18}
                className="shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#B22222]"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
