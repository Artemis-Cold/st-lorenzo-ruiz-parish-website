import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Megaphone } from "lucide-react";

import { getPublicAnnouncements, type Announcement } from "@/services/announcementService";

const postedDate = (value: string) => new Date(value).toLocaleDateString("en-US", {
  month: "long", day: "numeric", year: "numeric",
});

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicAnnouncements().then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const [featured, ...more] = items;

  return <section id="announcements" className="relative overflow-hidden bg-[#F7F3EC] py-14 md:py-16 xl:py-20">
    <div aria-hidden className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[70px] border-[#D4AF37]/10" />
    <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
      <div className="grid gap-4 border-b border-[#D9D0C3] pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.25em] text-[#B22222]"><Megaphone size={18} />Parish bulletin</div><h2 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-tight text-[#292524] md:text-5xl">News and notices from our parish community</h2></div>
        <p className="max-w-sm text-sm leading-6 text-gray-600">Official schedules, office advisories, liturgical activities, and community announcements published by the parish staff.</p>
      </div>

      {loading ? <div className="mt-7 grid gap-5 lg:grid-cols-[1.3fr_1fr]"><div className="h-72 animate-pulse rounded-3xl bg-white/70" /><div className="space-y-3">{[1,2,3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/70" />)}</div></div>
      : !featured ? <div className="mt-7 rounded-3xl border border-dashed border-[#CFC4B5] bg-white/60 px-6 py-12 text-center"><Megaphone className="mx-auto text-[#B22222]/30" size={38} /><p className="mt-3 font-medium text-gray-600">No announcements have been posted yet.</p></div>
      : <div className="mt-7 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <article className="group relative flex min-h-[285px] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br from-[#8E1B1B] to-[#4E1010] p-6 text-white shadow-lg md:p-7">
            <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[45px] border-white/5" />
            <span className="relative w-fit rounded-full border border-[#F5D76E]/40 bg-[#F5D76E]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#F5D76E]">Latest announcement</span>
            <div className="relative mt-auto"><p className="flex items-center gap-2 text-xs text-white/70"><CalendarDays size={14} />{postedDate(featured.postedAt)}</p><h3 className="mt-3 max-w-2xl font-serif text-2xl font-bold leading-tight md:text-3xl">{featured.title}</h3><p className="mt-3 line-clamp-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-white/80">{featured.details}</p><div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-xs text-white/60"><span>Published by {featured.createdBy.name}</span><ArrowUpRight className="transition group-hover:-translate-y-1 group-hover:translate-x-1" size={18} /></div></div>
          </article>

          <div className="rounded-3xl border border-[#DED5C9] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-serif text-lg font-bold text-[#292524]">More notices</h3><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Recent</span></div><div className="mt-2 divide-y divide-gray-100">{more.slice(0, 3).map((item) => <article key={item.id} className="py-3.5 first:pt-2"><p className="text-[11px] font-medium text-[#B22222]">{postedDate(item.postedAt)}</p><h4 className="mt-1 line-clamp-1 font-serif font-bold text-[#292524]">{item.title}</h4><p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{item.details}</p></article>)}{more.length === 0 && <div className="py-10 text-center text-sm text-gray-400">Additional notices will appear here.</div>}</div></div>
        </div>}
    </div>
  </section>;
}
