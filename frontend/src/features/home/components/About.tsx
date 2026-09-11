import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Cross,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";

import { parishImages } from "../data/images";

function ParishImageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = parishImages[activeIndex];
  const hasMultipleImages = parishImages.length > 1;

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? parishImages.length - 1 : current - 1,
    );
  };

  const showNext = () => {
    setActiveIndex((current) =>
      current === parishImages.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <div className="relative h-72 overflow-hidden rounded-3xl bg-[#2A0909] shadow-xl sm:h-80 lg:h-full">
      <motion.img
        key={activeImage.src}
        initial={{ opacity: 0.75, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        src={activeImage.src}
        alt={activeImage.alt}
        className="h-full w-full object-cover"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/75 to-transparent"
      />
      <p className="absolute bottom-5 left-5 right-5 text-sm font-semibold text-white sm:text-base">
        {activeImage.caption}
      </p>

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Show previous parish image"
            className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Show next parish image"
            className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronRight size={20} />
          </button>

          <div
            className="absolute bottom-5 right-5 flex gap-1.5"
            aria-label="Choose parish image"
          >
            {parishImages.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show parish image ${index + 1}`}
                aria-current={activeIndex === index}
                className={`h-1.5 rounded-full transition-all ${activeIndex === index ? "w-6 bg-[#F5D76E]" : "w-1.5 bg-white/60 hover:bg-white"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="scroll-mt-18 bg-white py-14 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-9 text-center"
        >
          <span className="font-semibold uppercase tracking-[0.3em] text-[#B22222]">
            About the Parish
          </span>

          <h2 className="mt-3 font-serif text-4xl font-bold text-[#222222] md:text-5xl">
            St. Lorenzo Ruiz Parish
          </h2>

          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#D4AF37]" />
        </motion.div>

        {/* Content */}
        <div
          id="history"
          className="grid scroll-mt-24 items-stretch gap-9 lg:grid-cols-2 lg:gap-12"
        >
          {/* Church Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="h-full"
          >
            <ParishImageCarousel />
          </motion.div>

          {/* About Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="font-serif text-2xl font-bold text-[#B22222] lg:text-3xl">
              Kasaysayang Hinubog ng Pananampalataya
            </h3>

            <p className="mt-4 text-justify text-sm leading-6 text-gray-600 lg:text-base lg:leading-7">
              Itinatag ang Parokya ng San Lorenzo Ruiz noong Setyembre 19, 2010
              sa pangunguna ni Arsobispo Ramon C. Argüelles, kasama si Rdo. P.
              Benedicto Ortega Malaluan bilang unang kura paroko. Saklaw nito
              ang mga barangay ng Bacao, Piña, Laurel, Dagatan, at Mapulo, na
              sama-samang kinikilala bilang BAPILADAMA.
            </p>

            <p className="mt-3 text-justify text-sm leading-6 text-gray-600 lg:text-base lg:leading-7">
              Sa 1.2 ektaryang lupang ipinagkaloob nina Gregoria Natividad
              Flores Chavez at Julia Flores Panganiban, inilagay ang panulukang
              bato noong Mayo 12, 2013. Sa pagtutulungan ng mga parokyano,
              layko, kaibigan, at mga paring diyosesano, naitayo ang simbahan sa
              panahon ni Reb. P. Estelito Lontoc Africa Jr. Naglaan din ang
              Arsidiyosesis ng Lipa ng karagdagang tatlong ektarya para sa mga
              susunod na gawain ng parokya. Dinisenyo ang simbahan nina
              Architect Suzette Chua-Caringal, Architect Joseph M. Villanueva,
              at Engr. Luigi H. Montenegro, at kinonsagra noong Setyembre 26,
              2016, sa Taon ng Hubileo ng Awa.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#FAF7F2] p-4">
                <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#B22222] text-white">
                  <MapPin size={19} />
                </div>

                <h4 className="font-semibold text-[#222]">Location</h4>

                <p className="mt-2 text-sm text-gray-600">
                  Dagatan, Taysan, Batangas, Philippines
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF7F2] p-4">
                <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37] text-white">
                  <Cross size={19} />
                </div>

                <h4 className="font-semibold text-[#222]">Patron Saint</h4>

                <p className="mt-2 text-sm text-gray-600">St. Lorenzo Ruiz</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.section
          id="contacts"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          className="mt-10 scroll-mt-24 overflow-hidden rounded-3xl border border-[#E8E0D5] bg-[#FAF7F2] p-5 sm:p-7"
        >
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#B22222]">
                Parish contacts
              </span>
              <h3 className="mt-2 font-serif text-2xl font-bold text-[#292524]">
                Visit or contact the parish office
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Reach the parish office for service inquiries, schedules, and
                pastoral assistance.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="tel:09543102130"
                className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100 transition hover:-translate-y-0.5 hover:ring-red-200"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-50 text-[#B22222]">
                  <Phone size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-gray-500">
                    Contact number
                  </span>
                  <span className="mt-0.5 block font-semibold text-[#292524]">
                    0954 310 2130
                  </span>
                </span>
              </a>

              <a
                href="mailto:stlorenzoruizparish@gmail.com"
                className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100 transition hover:-translate-y-0.5 hover:ring-red-200"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-[#B8860B]">
                  <Mail size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-gray-500">
                    Email address
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-semibold text-[#292524]">
                    stlorenzoruizparish@gmail.com
                  </span>
                </span>
              </a>
            </div>
          </div>
        </motion.section>
      </div>
    </section>
  );
}
