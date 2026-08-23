import {
  CalendarDays,
  Church,
  Cross,
  HeartHandshake,
  MapPin,
  UsersRound,
} from "lucide-react";

import churchImage from "@/assets/images/church.jpg";
import parishLogo from "@/assets/images/parish-logo.png";
import DashboardLayout from "../components/DashboardLayout";

const milestones = [
  {
    year: "2010",
    date: "Setyembre 19",
    title: "Pagkakatatag ng Parokya",
    description:
      "Itinatag ang Parokya ng San Lorenzo Ruiz at itinalaga si Rdo. P. Benedicto Ortega Malaluan bilang unang kura paroko.",
  },
  {
    year: "2013",
    date: "Mayo 12",
    title: "Pagbuhos ng Panulukang Bato",
    description:
      "Inihugos ang panulukang bato ng simbahan sa lupang ipinagkaloob para sa pagtatayo ng bagong tahanan ng parokya.",
  },
  {
    year: "2016",
    date: "Setyembre 26",
    title: "Pagtatalaga at Konsekrasyon",
    description:
      "Itinalaga at kinonsagra ang simbahan noong Taon ng Hubileo ng Awa, kasama ang mga pari at relihiyoso.",
  },
] as const;

export default function About() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="relative min-h-105 overflow-hidden rounded-[2rem] shadow-xl">
          <img
            src={churchImage}
            alt="Parishioners gathered inside St. Lorenzo Ruiz Parish in Dagatan, Taysan, Batangas"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/65 to-[#7A1717]/25" />
          <div className="relative flex min-h-105 max-w-3xl flex-col justify-end p-7 text-white sm:p-12">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <img
                src={parishLogo}
                alt="Logo of St. Lorenzo Ruiz Parish"
                className="size-19 rounded-full border-2 border-[#D4AF37] bg-white object-contain shadow-lg sm:size-21"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F5D76E]">
                  Kasaysayan ng ating parokya
                </p>
                <h1 className="mt-1 font-serif text-3xl font-bold leading-tight sm:text-5xl">
                  St. Lorenzo Ruiz Parish
                </h1>
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              Isang pamayanang hinubog ng pananampalataya, pagkakaisa, at
              paglilingkod sa mga barangay ng Bacao, Piña, Laurel, Dagatan, at
              Mapulo—ang pamayanang BAPILADAMA.
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm text-white/70">
              <MapPin size={17} />
              Brgy. Dagatan, Taysan, Batangas
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-[#E7E2DA] bg-white p-7 shadow-sm sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
            <div>
              <div className="grid size-13 place-items-center rounded-2xl bg-red-50 text-[#B22222]">
                <Church size={27} />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#B22222]">
                Ang aming pinagmulan
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold leading-tight text-[#292524] sm:text-4xl">
                Isang simbahang itinayo sa pananampalataya
              </h2>
            </div>

            <div className="space-y-5 text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
              <p>
                Mula sa adhikain ng Simbahang Katolika na higit pang maipadama
                ang presensya ng Diyos, itinatag ang Parokya ng San Lorenzo Ruiz
                noong Setyembre 19, 2010 ni Lubhang Kgg. Ramon C. Argüelles,
                D.D., S.T.L. Itinalaga si Rdo. P. Benedicto Ortega Malaluan
                bilang unang kura paroko.
              </p>
              <p>
                Binubuo ang parokya ng mga barangay ng Bacao, Piña, Laurel,
                Dagatan, at Mapulo. Ang kanilang mga pangalan ang bumubuo sa
                BAPILADAMA—isang pamayanang nagkakaisa sa pananampalataya at
                paglilingkod.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {milestones.map((milestone) => (
            <article
              key={milestone.year}
              className="relative overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-sm"
            >
              <span className="absolute -right-3 -top-7 font-serif text-8xl font-bold text-[#B22222]/5">
                {milestone.year.slice(2)}
              </span>
              <CalendarDays className="relative text-[#B22222]" size={25} />
              <p className="relative mt-5 font-serif text-3xl font-bold text-[#B22222]">
                {milestone.year}
              </p>
              <p className="relative mt-1 text-xs font-semibold uppercase tracking-wider text-[#9A7A23]">
                {milestone.date}
              </p>
              <h3 className="relative mt-4 font-semibold text-[#292524]">
                {milestone.title}
              </h3>
              <p className="relative mt-2 text-sm leading-6 text-gray-600">
                {milestone.description}
              </p>
            </article>
          ))}
        </section>

        <section className="grid overflow-hidden rounded-3xl bg-[#FAF8F5] lg:grid-cols-2">
          <div className="p-7 sm:p-10 lg:p-12">
            <HeartHandshake className="text-[#B22222]" size={31} />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#B22222]">
              Handog at pagtutulungan
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-[#292524]">
              Lupang naging tahanan ng pananampalataya
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-gray-600 sm:text-base">
              <p>
                Ipinagkaloob ng magkapatid na Gregoria Natividad Flores Chavez
                at Julia Flores Panganiban ang 12,000 metro kuwadrado o 1.2
                ektaryang lupa para sa pagtatayo ng simbahan. Noong Mayo 12,
                2013, inihugos ang panulukang bato nito.
              </p>
              <p>
                Sa pagdadamayan ng mga parokyano, tulong ng mga layko, suporta
                ng mga kaibigan sa loob at labas ng bansa, at paggabay ng mga
                paring diyosesano ng Arsidiyosesis ng Lipa, naitayo ang gusaling
                simbahan sa panahon ni Reb. P. Estelito Lontoc Africa Jr., ang
                ikalawang kura paroko.
              </p>
            </div>
          </div>

          <div className="bg-linear-to-br from-[#B22222] to-[#681111] p-7 text-white sm:p-10 lg:p-12">
            <UsersRound className="text-[#F5D76E]" size={31} />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#F5D76E]">
              Paglawak at pagkakabuo
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold">
              Inihanda para sa mga susunod na apostolado
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/80 sm:text-base">
              <p>
                Binili ng Arsidiyosesis ng Lipa ang karatig na tatlong ektarya
                bilang paghahanda sa mga darating na apostolado ng parokya.
              </p>
              <p>
                Ang simbahang bato ay iginuhit at isinaayos sa tulong, galing,
                at malasakit nina Architect Suzette Chua-Caringal, Architect
                Joseph M. Villanueva, at Engr. Luigi H. Montenegro.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#D4AF37]/35 bg-white p-7 text-center shadow-sm sm:p-11">
          <Cross className="mx-auto text-[#B22222]" size={34} />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#B22222]">
            Taon ng Hubileo ng Awa
          </p>
          <h2 className="mx-auto mt-2 max-w-3xl font-serif text-3xl font-bold text-[#292524] sm:text-4xl">
            Pagtatalaga ng Simbahan ng San Lorenzo Ruiz
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            Noong Setyembre 26, 2016, itinalaga at kinonsagra ni Lubhang Kgg.
            Arsobispo Ramon C. Argüelles, kaisa ng mga pari at relihiyoso, ang
            Simbahan ng San Lorenzo Ruiz bilang tahanan ng pananalangin,
            pagkakaisa, at paglilingkod ng buong pamayanan.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
