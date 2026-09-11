import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  ImageIcon,
  ShieldCheck,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  getPublicMarriageBanns,
  type MarriageBann,
} from "@/services/marriageBannService";

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);

  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function MarriageBanns() {
  const [banns, setBanns] = useState<MarriageBann[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBannIndex, setActiveBannIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const activeBann = banns[activeBannIndex];
  const activePhoto = activeBann?.photos[activePhotoIndex];

  useEffect(() => {
    getPublicMarriageBanns()
      .then(setBanns)
      .catch(() => setBanns([]))
      .finally(() => setLoading(false));
  }, []);

  const showBann = (index: number) => {
    setActiveBannIndex(index);
    setActivePhotoIndex(0);
  };

  const showPreviousBann = () => {
    showBann(activeBannIndex === 0 ? banns.length - 1 : activeBannIndex - 1);
  };

  const showNextBann = () => {
    showBann(activeBannIndex === banns.length - 1 ? 0 : activeBannIndex + 1);
  };

  const showPreviousPhoto = () => {
    if (!activeBann?.photos.length) return;
    setActivePhotoIndex((current) =>
      current === 0 ? activeBann.photos.length - 1 : current - 1,
    );
  };

  const showNextPhoto = () => {
    if (!activeBann?.photos.length) return;
    setActivePhotoIndex((current) =>
      current === activeBann.photos.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <section
      id="holy-matrimony"
      className="relative scroll-mt-18 overflow-hidden bg-linear-to-b from-white via-[#FCFAF7] to-white py-14 md:py-16"
    >
      <div
        aria-hidden
        className="absolute -left-32 top-20 size-80 rounded-full bg-[#D4AF37]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-36 bottom-6 size-80 rounded-full bg-[#B22222]/6 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#B22222]/15 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B22222] shadow-sm sm:px-4 sm:text-xs sm:tracking-[0.24em]">
            <Heart size={15} fill="currentColor" className="opacity-90" />
            Holy Matrimony
          </div>
          <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-[#292524] md:text-4xl">
            Couples preparing for the Sacrament of Marriage
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#D4AF37]" />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
            We prayerfully introduce the couples preparing to receive the
            Sacrament of Holy Matrimony. For any pastoral concern, please
            communicate privately with the parish office.
          </p>
        </motion.div>

        {loading ? (
          <div className="mx-auto mt-9 grid min-h-96 max-w-5xl overflow-hidden rounded-[2rem] border border-[#E7E2DA] bg-white lg:grid-cols-[1.05fr_0.95fr]">
            <Skeleton className="min-h-72 rounded-none bg-gray-200/80" />
            <div className="space-y-5 p-8">
              <Skeleton className="h-5 w-36 rounded-full bg-gray-200" />
              <Skeleton className="h-14 max-w-sm rounded-xl bg-gray-200" />
              <Skeleton className="h-24 rounded-2xl bg-gray-100" />
            </div>
          </div>
        ) : !activeBann ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto mt-9 max-w-5xl rounded-[2rem] border border-dashed border-[#D9D0C3] bg-white/80 px-6 py-12 text-center shadow-sm"
          >
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#B22222]/6 text-[#B22222]/45">
              <Heart size={30} />
            </span>
            <p className="mt-4 font-serif text-xl font-semibold text-[#292524]">
              There are no Holy Matrimony notices at this time.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Upcoming couples will appear here during their approved
              publication period.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mx-auto mt-9 max-w-5xl"
          >
            <article className="group grid overflow-hidden rounded-[2rem] border border-[#E3DBCF] bg-white shadow-[0_20px_55px_-32px_rgba(58,38,31,0.45)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_65px_-30px_rgba(58,38,31,0.5)] lg:grid-cols-[1.06fr_0.94fr]">
              <div
                className="relative flex h-72 items-center justify-center overflow-hidden bg-[#211A18] outline-none sm:h-88 lg:h-105"
                tabIndex={activeBann.photos.length > 1 ? 0 : -1}
                aria-label="Couple photo gallery. Use the left and right arrow keys to browse photos."
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") showPreviousPhoto();
                  if (event.key === "ArrowRight") showNextPhoto();
                }}
              >
                {activePhoto ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={`background-${activeBann.id}-${activePhoto.url}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.38 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        src={activePhoto.url}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-black/25" />
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={`${activeBann.id}-${activePhoto.url}`}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.38, ease: "easeOut" }}
                        src={activePhoto.url}
                        alt={`Submitted wedding photo ${activePhotoIndex + 1} of ${activeBann.brideName} and ${activeBann.groomName}`}
                        className="relative z-10 h-full w-full object-contain p-3 drop-shadow-2xl sm:p-5"
                      />
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex flex-col items-center px-6 text-center text-white/50">
                    <span className="grid size-16 place-items-center rounded-full border border-white/10 bg-white/5">
                      <ImageIcon size={31} />
                    </span>
                    <p className="mt-3 text-sm">
                      No couple photo is available.
                    </p>
                  </div>
                )}

                {activeBann.photos.length > 0 && (
                  <div className="absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                    Photo {activePhotoIndex + 1} of {activeBann.photos.length}
                  </div>
                )}

                {activeBann.photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousPhoto}
                      aria-label="Show previous submitted photo"
                      className="absolute left-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 text-white opacity-100 backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
                    >
                      <ChevronLeft size={21} />
                    </button>
                    <button
                      type="button"
                      onClick={showNextPhoto}
                      aria-label="Show next submitted photo"
                      className="absolute right-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 text-white opacity-100 backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
                    >
                      <ChevronRight size={21} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 z-20 flex max-w-[75%] -translate-x-1/2 gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md">
                      {activeBann.photos.map((photo, index) => (
                        <button
                          key={photo.url}
                          type="button"
                          onClick={() => setActivePhotoIndex(index)}
                          aria-label={`Show submitted photo ${index + 1}`}
                          aria-current={activePhotoIndex === index}
                          className={`h-1.5 shrink-0 rounded-full transition-all duration-300 ${activePhotoIndex === index ? "w-7 bg-[#F5D76E]" : "w-1.5 bg-white/55 hover:bg-white"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeBann.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex min-h-full flex-col overflow-hidden p-6 sm:p-8 lg:p-9"
                  aria-live="polite"
                >
                  <div
                    aria-hidden
                    className="absolute -right-16 -top-16 size-52 rounded-full border-32 border-[#D4AF37]/8 transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="relative flex items-center justify-between gap-3">
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#B22222] text-white shadow-lg shadow-[#B22222]/20 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                      <Heart size={20} fill="currentColor" />
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/35 bg-[#FFF9E8] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#806216] sm:px-3 sm:text-[10px] sm:tracking-[0.14em]">
                      <ShieldCheck size={14} /> Parish published
                    </span>
                  </div>

                  <p className="relative mt-7 text-[11px] font-bold uppercase tracking-[0.2em] text-[#B22222]">
                    Bride &amp; Groom
                  </p>
                  <h3 className="relative mt-2 font-serif text-2xl font-bold leading-snug text-[#292524] sm:text-3xl">
                    {activeBann.brideName}
                    <span className="my-1 block font-sans text-sm font-semibold italic text-[#B22222]">
                      and
                    </span>
                    {activeBann.groomName}
                  </h3>

                  <div className="relative mt-6 rounded-2xl border border-[#E7E2DA] bg-[#FAF8F5] p-4 transition-colors duration-300 group-hover:border-[#D4AF37]/40">
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#B22222] shadow-sm">
                        <CalendarDays size={18} />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                          Wedding celebration
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#292524]">
                          {formatDate(activeBann.weddingDate)}
                        </p>
                        {activeBann.weddingTime && (
                          <p className="mt-0.5 text-sm text-gray-600">
                            {formatTime(activeBann.weddingTime)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-5 border-l-2 border-[#D4AF37] pl-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                      Publication period
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      {formatDate(activeBann.publicationStart)} —{" "}
                      {formatDate(activeBann.publicationEnd)}
                    </p>
                  </div>

                  <p className="relative mt-auto pt-6 text-xs leading-5 text-gray-500">
                    Please communicate any concern privately and directly with
                    the parish office.
                  </p>
                </motion.div>
              </AnimatePresence>
            </article>

            {banns.length > 1 && (
              <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#E7E2DA] bg-white/85 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:pl-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                    <span>
                      Couple {activeBannIndex + 1} of {banns.length}
                    </span>
                    <span>
                      {Math.round(((activeBannIndex + 1) / banns.length) * 100)}
                      %
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EFEAE3]">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-[#B22222] to-[#D4AF37] transition-all duration-500"
                      style={{
                        width: `${((activeBannIndex + 1) / banns.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={showPreviousBann}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E7E2DA] bg-white px-4 py-2.5 text-sm font-semibold text-[#292524] transition duration-300 hover:-translate-x-0.5 hover:border-[#B22222]/30 hover:text-[#B22222] focus-visible:ring-2 focus-visible:ring-[#B22222]/30"
                  >
                    <ChevronLeft size={17} /> Previous
                  </button>
                  <button
                    type="button"
                    onClick={showNextBann}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B22222] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#B22222]/15 transition duration-300 hover:translate-x-0.5 hover:bg-[#991B1B] focus-visible:ring-2 focus-visible:ring-[#B22222]/30"
                  >
                    Next <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
