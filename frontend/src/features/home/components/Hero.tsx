import { ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";

import parishLogo from "../../../assets/images/parish-logo.png";
import churchImage from "../../../assets/images/church.png";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${churchImage})`,
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Parish Red Overlay */}
      <div className="absolute inset-0 bg-[#7A1717]/20" />


      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 text-center text-white">
        <motion.img
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          src={parishLogo}
          alt="St. Lorenzo Ruiz Parish Logo"
          className="mb-8 h-36 w-36 rounded-full border-4 border-[#D4AF37] bg-white shadow-2xl"
        />

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-full border border-[#D4AF37] bg-[#D4AF37]/15 px-5 py-2 text-sm font-medium uppercase tracking-[0.2em] text-[#F5D76E] backdrop-blur-sm"
        >
          Official Parish Service Information System
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 max-w-5xl font-serif text-5xl font-bold leading-tight md:text-7xl"
        >
          Serving Faith
          <span className="block text-[#F5D76E]">Through Technology</span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-6 text-2xl font-semibold text-white"
        >
          St. Lorenzo Ruiz Parish
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-2 flex items-center gap-2 text-gray-200"
        >
          <MapPin size={18} />
          Dagatan, Taysan, Batangas
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-8 max-w-3xl text-lg leading-8 text-gray-200"
        >
          Conveniently book parish services, submit mass intentions, request
          parish documents, receive SMS notifications, and explore the parish
          through an interactive web platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex flex-wrap justify-center gap-4 mb-12"
        >
          <button className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#B22222] px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#981B1B]">
            Book a Service
            <ArrowRight size={18} />
          </button>

          <button className="cursor-pointer rounded-xl border-2 border-white px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-[#B22222]">
            Learn More
          </button>
        </motion.div>
      </div>
    </section>
  );
}
