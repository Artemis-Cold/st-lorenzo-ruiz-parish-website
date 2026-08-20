import { useState } from "react";
import { ChevronDown, CircleHelp, Clock3, FileCheck2, Mail, MapPin, MessageSquareText, Phone, Search } from "lucide-react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";

const faqs = [
  ["How can I track my booking?", "Open My Profile and select Current Bookings or Recent Bookings. Click a booking card to view its status, schedule, submitted files, payment information, and service-specific details."],
  ["When will I receive an SMS?", "SMS notifications are sent for document status updates, baptism or wedding seminar schedules, and priest interviews. Make sure the mobile number in your profile is current."],
  ["How do I know when a requested document is ready?", "The request status changes to Ready for Pickup and an SMS is sent to your registered mobile number. The status also appears under My Profile → Documents."],
  ["Can I submit multiple document requests together?", "Yes. Select the documents you need in one request. Their individual prices and the combined total are shown before submission."],
  ["Can I change a submitted booking?", "Contact the parish office and provide your booking reference. Changes depend on availability and the current processing status."],
  ["What should I do if I forget my password?", "Select Forgot Password on the appropriate login page. Enter your username and registered mobile number, then use the six-digit SMS code to set a new password."],
] as const;

export default function Help() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(0);
  const filtered = faqs.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(query.toLowerCase()));

  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-8">
    <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#B22222] to-[#671313] px-7 py-12 text-white shadow-xl sm:px-12"><div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[45px] border-white/5" /><div className="relative max-w-3xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#F5D76E]"><CircleHelp size={17} />Parishioner support</div><h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">How can we help?</h1><p className="mt-4 max-w-2xl leading-7 text-white/75">Find guidance for bookings, document requests, payments, notifications, and account access.</p><div className="relative mt-7 max-w-xl"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search help topics..." className="w-full rounded-2xl bg-white py-4 pl-12 pr-4 text-gray-900 shadow-lg outline-none" /></div></div></header>

    <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
      <section className="rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-sm sm:p-8"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-wider text-[#B22222]">Frequently asked questions</p><h2 className="mt-2 font-serif text-2xl font-bold">Quick answers</h2></div><div className="divide-y divide-gray-100">{filtered.map(([question, answer]) => { const index = faqs.findIndex(([item]) => item === question); const expanded = open === index; return <div key={question} className="py-2"><button onClick={() => setOpen(expanded ? null : index)} className="flex w-full items-center justify-between gap-4 py-4 text-left font-semibold text-[#292524]"><span>{question}</span><ChevronDown className={`shrink-0 text-[#B22222] transition ${expanded ? "rotate-180" : ""}`} size={19} /></button>{expanded && <p className="pb-5 pr-8 text-sm leading-7 text-gray-600">{answer}</p>}</div>; })}{filtered.length === 0 && <p className="py-12 text-center text-gray-400">No help topic matches your search.</p>}</div></section>

      <aside className="space-y-6"><section className="rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-red-50 p-3 text-[#B22222]"><MessageSquareText size={22} /></div><div><h2 className="font-serif text-xl font-bold">Parish Office</h2><p className="text-xs text-gray-500">For requests requiring staff assistance</p></div></div><div className="mt-6 space-y-4 text-sm"><Info icon={Phone} label="Contact number" value="(043) 123-4567" /><Info icon={Mail} label="Email" value="parish@email.com" /><Info icon={Clock3} label="Office hours" value="Monday–Saturday, 8:00 AM–5:00 PM" /><Info icon={MapPin} label="Location" value="Dagatan, Taysan, Batangas" /></div></section><section className="rounded-3xl bg-[#F4EFE7] p-6"><FileCheck2 className="text-[#B22222]" /><h3 className="mt-4 font-serif text-lg font-bold">Have your reference ready</h3><p className="mt-2 text-sm leading-6 text-gray-600">When contacting the office, provide the reference shown in your booking or document request for faster assistance.</p><Link to="/profile" className="mt-4 inline-flex text-sm font-semibold text-[#B22222] hover:underline">View my requests →</Link></section></aside>
    </div>
  </div></DashboardLayout>;
}

function Info({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return <div className="flex gap-3"><Icon className="mt-0.5 shrink-0 text-[#B22222]" size={17} /><div><p className="text-xs uppercase tracking-wide text-gray-400">{label}</p><p className="mt-0.5 font-medium text-gray-700">{value}</p></div></div>;
}
