import { BellRing, BookOpenText, Church, FileText, HeartHandshake, MapPin, ShieldCheck, Smartphone } from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import churchImage from "@/assets/images/church.png";
import parishLogo from "@/assets/images/parish-logo.png";

const capabilities = [
  [Smartphone, "Online parish services", "Submit sacramental bookings, Mass intentions, and document requests from one secure account."],
  [BellRing, "Timely notifications", "Receive updates for document readiness, baptism and wedding seminars, and interviews with the parish priest."],
  [FileText, "Clear request tracking", "Review schedules, requirements, payments, submitted files, and processing status."],
  [ShieldCheck, "Protected information", "Role-based access keeps parishioner records separate from staff administration."],
] as const;

export default function About() {
  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-8">
    <header className="relative min-h-[430px] overflow-hidden rounded-[2rem] shadow-xl"><img src={churchImage} alt="St. Lorenzo Ruiz Parish church" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-[#7A1717]/30" /><div className="relative flex min-h-[430px] max-w-3xl flex-col justify-end p-8 text-white sm:p-12"><div className="flex items-center gap-4"><img src={parishLogo} alt="Parish logo" className="h-20 w-20 rounded-full border-2 border-[#D4AF37] bg-white" /><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F5D76E]">Our parish community</p><h1 className="mt-1 font-serif text-4xl font-bold sm:text-5xl">St. Lorenzo Ruiz Parish</h1></div></div><p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">A spiritual home serving the faithful of Dagatan, Taysan, Batangas through worship, formation, compassionate service, and responsible use of technology.</p><p className="mt-5 flex items-center gap-2 text-sm text-white/70"><MapPin size={17} />Dagatan, Taysan, Batangas, Philippines</p></div></header>

    <div className="grid gap-8 lg:grid-cols-2"><section className="rounded-3xl border border-[#E7E2DA] bg-white p-8 shadow-sm"><BookOpenText className="text-[#B22222]" size={30} /><p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#B22222]">Who we are</p><h2 className="mt-2 font-serif text-3xl font-bold text-[#292524]">Faith, prayer, and community</h2><p className="mt-5 leading-8 text-gray-600">Guided by the teachings of Christ and inspired by the witness of St. Lorenzo Ruiz, the parish provides sacramental celebrations, spiritual formation, and pastoral programs that strengthen families and foster unity.</p></section><section className="rounded-3xl bg-gradient-to-br from-[#B22222] to-[#741515] p-8 text-white shadow-lg"><HeartHandshake className="text-[#F5D76E]" size={32} /><p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#F5D76E]">Our mission</p><h2 className="mt-2 font-serif text-3xl font-bold">Serving with care and integrity</h2><p className="mt-5 leading-8 text-white/75">We aim to make parish services more accessible while preserving the personal, pastoral relationship between parishioners and parish staff.</p></section></div>

    <section className="rounded-3xl border border-[#E7E2DA] bg-white p-7 shadow-sm sm:p-10"><div className="mx-auto max-w-3xl text-center"><Church className="mx-auto text-[#B22222]" size={34} /><p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#B22222]">ParishConnect</p><h2 className="mt-2 font-serif text-3xl font-bold">A more organized parish experience</h2><p className="mt-4 leading-7 text-gray-600">This system supports parishioners before, during, and after submitting a request while giving staff the tools to respond efficiently.</p></div><div className="mt-9 grid gap-5 md:grid-cols-2">{capabilities.map(([Icon, title, description]) => <article key={title} className="rounded-2xl bg-[#FAF8F5] p-6"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#B22222] shadow-sm"><Icon size={21} /></div><h3 className="mt-4 font-semibold text-[#292524]">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{description}</p></article>)}</div></section>
  </div></DashboardLayout>;
}
