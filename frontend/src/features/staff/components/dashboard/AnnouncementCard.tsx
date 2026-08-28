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
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white p-5 shadow-sm">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B22222]/10 text-[#B22222]">
            <Megaphone size={18} />
          </div>
          <h2 className="font-serif text-lg font-bold text-[#292524]">
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
        <div className="grid min-h-0 flex-1 place-items-center rounded-2xl border border-dashed border-[#E7E2DA] py-8 text-center">
          <Megaphone className="mx-auto mb-3 text-gray-300" size={28} />
          <p className="text-sm text-gray-400">No announcements posted yet.</p>
        </div>
      ) : (
        <div
          data-modal-scroll="true"
          className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1"
        >
          {announcements.map((item) => (
            <Link
              key={item.id}
              to="/staff/announcements"
              className="group flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-[#E7E2DA] p-3 text-left transition hover:border-[#B22222]/30 hover:bg-[#B22222]/[0.03]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#B22222] text-white">
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
