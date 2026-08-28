import { ArrowRight, MapPin, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import parishLogo from "../../../assets/images/pdf-logo.png";
import churchImage from "../../../assets/images/church.jpg";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-svh items-center justify-center overflow-hidden px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28 lg:px-8"
    >
      <div
        className="absolute inset-0 -z-30 scale-[1.02] bg-cover bg-position-[58%_center] bg-no-repeat sm:bg-center"
        style={{
          backgroundImage: `url(${churchImage})`,
        }}
      />

      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-linear-to-b from-black/80 via-black/55 to-[#260505]/90"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_38%,rgba(122,23,23,0.08),rgba(122,23,23,0.42)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-black/35 to-transparent"
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center text-white">
        <motion.img
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          src={parishLogo}
          alt="St. Lorenzo Ruiz Parish Logo"
          className="mb-6 size-20 rounded-full border-[3px] border-[#D4AF37] bg-white p-1 shadow-[0_18px_55px_rgba(0,0,0,0.38)] sm:mb-7 sm:size-26 lg:size-28"
        />

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="max-w-full rounded-full border border-[#D4AF37]/60 bg-black/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F5D76E] shadow-lg backdrop-blur-md sm:px-5 sm:text-xs sm:tracking-[0.2em] md:text-sm"
        >
          Official Parish Service Information System
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.65, ease: "easeOut" }}
          className="mt-6 max-w-4xl text-balance font-serif text-4xl font-bold leading-[1.08] tracking-tight sm:mt-7 sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Serving Faith
          <span className="mt-1 block text-[#F5D76E] drop-shadow-[0_3px_18px_rgba(0,0,0,0.35)]">
            Through Technology
          </span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-5 font-serif text-xl font-semibold tracking-wide text-white sm:mt-6 md:text-2xl"
        >
          St. Lorenzo Ruiz Parish
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-2 flex items-center gap-2 text-sm text-white/75 md:text-base"
        >
          <MapPin className="shrink-0 text-[#F5D76E]" size={17} />
          Dagatan, Taysan, Batangas
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.55 }}
          className="mt-6 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-black/20 p-1.5 shadow-2xl backdrop-blur-md sm:w-auto sm:flex-row sm:items-center"
        >
          <a
            href="mailto:stlorenzoruizparish@gmail.com"
            className="flex min-w-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white/85 transition hover:bg-white/10 hover:text-white md:text-base"
          >
            <Mail className="shrink-0 text-[#F5D76E]" size={17} />
            <span className="min-w-0 break-all sm:break-normal">
              stlorenzoruizparish@gmail.com
            </span>
          </a>
          <span aria-hidden className="hidden h-5 w-px bg-white/20 sm:block" />
          <a
            href="tel:09543102130"
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white/85 transition hover:bg-white/10 hover:text-white md:text-base"
          >
            <Phone className="shrink-0 text-[#F5D76E]" size={17} />
            0954 310 2130
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8 flex w-full max-w-md flex-col justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4"
        >
          <Link
            to="/login"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#B22222] px-7 py-3.5 font-semibold text-white shadow-[0_12px_30px_rgba(96,10,10,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#981B1B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:px-8"
          >
            Book a Service
            <ArrowRight
              className="transition-transform duration-300 group-hover:translate-x-1"
              size={18}
            />
          </Link>

          <a
            href="#about"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/60 bg-white/6 px-7 py-3.5 font-semibold text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#B22222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-8"
          >
            Learn More
          </a>
        </motion.div>
      </div>
    </section>
  );
}
