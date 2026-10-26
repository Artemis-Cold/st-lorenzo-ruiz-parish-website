import { useState } from "react";
import { Bell, Megaphone } from "lucide-react";
import ParishModal from "@/components/ParishModal";
import type { AnnouncementItem } from "./AnnouncementCard";

export default function AnnouncementNotifications({
  announcements,
  userId,
  loading,
}: {
  announcements: AnnouncementItem[];
  userId: number;
  loading: boolean;
}) {
  const storageKey = `staff-announcements-read:${userId}`;
  const [seen, setSeen] = useState<string[]>(() => {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem(storageKey) ?? "[]",
      );
      return Array.isArray(stored)
        ? stored.filter((value): value is string => typeof value === "string")
        : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const fingerprint = (item: AnnouncementItem) =>
    `${item.id}:${item.title}:${item.details}`;
  const unread = announcements.filter(
    (item) => !seen.includes(fingerprint(item)),
  ).length;
  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          const next = announcements.map(fingerprint);
          setSeen(next);
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            /* Read state remains available for this visit. */
          }
          setOpen(true);
        }}
        aria-label={`Announcements, ${unread} unread`}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#E7E2DA] bg-white px-4 py-2.5 text-sm font-semibold text-[#B22222] shadow-sm transition hover:bg-red-50 disabled:opacity-50"
      >
        <Bell size={18} />
        Announcements
        {unread > 0 && (
          <span className="rounded-full bg-[#B22222] px-2 py-0.5 text-xs text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <ParishModal
          title="Parish announcements"
          description="Recent updates from the parish office."
          onClose={() => setOpen(false)}
        >
          <div className="space-y-3">
            {announcements.length ? (
              announcements.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#E7E2DA] bg-[#FAF8F5] p-4"
                >
                  <h3 className="flex items-start gap-2 font-semibold text-[#292524]">
                    <Megaphone
                      size={18}
                      className="mt-0.5 shrink-0 text-[#B22222]"
                    />
                    {item.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-600">
                    {item.details}
                  </p>
                </article>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-gray-500">
                You're all caught up. No announcements to show.
              </p>
            )}
          </div>
        </ParishModal>
      )}
    </>
  );
}
