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

  return <section id="announcements" className="relative overflow-hidden bg-[#F7F3EC] py-24">
    <div aria-hidden className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[70px] border-[#D4AF37]/10" />
    <div className="relative mx-auto max-w-7xl px-6">
      <div className="grid gap-6 border-b border-[#D9D0C3] pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.25em] text-[#B22222]"><Megaphone size={18} />Parish bulletin</div><h2 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-tight text-[#292524] md:text-5xl">News and notices from our parish community</h2></div>
        <p className="max-w-sm text-sm leading-6 text-gray-600">Official schedules, office advisories, liturgical activities, and community announcements published by the parish staff.</p>
      </div>

      {loading ? <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]"><div className="h-96 animate-pulse rounded-3xl bg-white/70" /><div className="space-y-4">{[1,2,3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-white/70" />)}</div></div>
      : !featured ? <div className="mt-10 rounded-3xl border border-dashed border-[#CFC4B5] bg-white/60 px-6 py-16 text-center"><Megaphone className="mx-auto text-[#B22222]/30" size={44} /><p className="mt-4 font-medium text-gray-600">No announcements have been posted yet.</p></div>
      : <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <article className="group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#8E1B1B] to-[#4E1010] p-8 text-white shadow-xl sm:p-10">
            <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[45px] border-white/5" />
            <span className="relative w-fit rounded-full border border-[#F5D76E]/40 bg-[#F5D76E]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#F5D76E]">Latest announcement</span>
            <div className="relative mt-auto"><p className="flex items-center gap-2 text-sm text-white/70"><CalendarDays size={16} />{postedDate(featured.postedAt)}</p><h3 className="mt-4 max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl">{featured.title}</h3><p className="mt-4 line-clamp-4 max-w-2xl whitespace-pre-line leading-7 text-white/80">{featured.details}</p><div className="mt-7 flex items-center justify-between border-t border-white/15 pt-5 text-xs text-white/60"><span>Published by {featured.createdBy.name}</span><ArrowUpRight className="transition group-hover:-translate-y-1 group-hover:translate-x-1" size={20} /></div></div>
          </article>

          <div className="rounded-[2rem] border border-[#DED5C9] bg-white p-6 shadow-sm sm:p-7"><div className="flex items-center justify-between"><h3 className="font-serif text-xl font-bold text-[#292524]">More notices</h3><span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recent</span></div><div className="mt-3 divide-y divide-gray-100">{more.slice(0, 4).map((item) => <article key={item.id} className="py-5 first:pt-3"><p className="text-xs font-medium text-[#B22222]">{postedDate(item.postedAt)}</p><h4 className="mt-1.5 font-serif text-lg font-bold text-[#292524]">{item.title}</h4><p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{item.details}</p></article>)}{more.length === 0 && <div className="py-12 text-center text-sm text-gray-400">Additional notices will appear here.</div>}</div></div>
        </div>}
    </div>
  </section>;
}
