import { CalendarDays, Megaphone } from "lucide-react";

import type { Announcement } from "@/services/announcementService";

export default function EventsCard({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <Megaphone className="text-[#B22222]" />
        <h2 className="font-serif text-2xl font-bold">Parish Announcements</h2>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-14 text-center text-gray-500">
          <Megaphone className="mx-auto mb-3 text-gray-300" size={44} />
          There are no parish announcements at this time.
        </div>
      ) : (
        <div className="space-y-5">
          {announcements.map((announcement) => (
            <article key={announcement.id} className="rounded-2xl border border-gray-100 p-5 transition hover:border-red-100 hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-serif text-xl font-bold text-[#292524]">{announcement.title}</h3>
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><CalendarDays size={14} />{new Date(announcement.postedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">{announcement.details}</p>
              <p className="mt-4 text-xs font-medium text-[#B22222]">Posted by {announcement.createdBy.name}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
