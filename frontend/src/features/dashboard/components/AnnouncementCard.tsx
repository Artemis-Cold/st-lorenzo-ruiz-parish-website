import { Megaphone } from "lucide-react";

const announcements = [
  {
    title: "Wedding Seminar",
    date: "June 12",
  },
  {
    title: "Parish Office Closed",
    date: "June 20",
  },
  {
    title: "Feast Day Celebration",
    date: "June 30",
  },
];

export default function AnnouncementCard() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-center gap-2">
        <Megaphone className="text-[#B22222]" />

        <h2 className="font-serif text-xl font-bold">Announcements</h2>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.title}
            className="rounded-xl bg-gray-50 p-4 transition hover:bg-gray-100"
          >
            <h3 className="font-semibold">{announcement.title}</h3>

            <p className="mt-1 text-sm text-gray-500">{announcement.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
    