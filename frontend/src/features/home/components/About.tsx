import { MapPin, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

import church from "../../../assets/images/church.png";

export default function About() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="font-semibold uppercase tracking-[0.3em] text-[#B22222]">
            About the Parish
          </span>

          <h2 className="mt-3 font-serif text-4xl font-bold text-[#222222] md:text-5xl">
            St. Lorenzo Ruiz Parish
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-[#D4AF37]" />
        </motion.div>

        {/* Content */}
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Church Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <img
              src={church}
              alt="St. Lorenzo Ruiz Parish"
              className="rounded-3xl shadow-2xl"
            />
          </motion.div>

          {/* About Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="font-serif text-3xl font-bold text-[#B22222]">
              A Place of Faith, Prayer, and Community
            </h3>

            <p className="mt-6 leading-8 text-gray-600">
              St. Lorenzo Ruiz Parish serves as a spiritual home for the
              faithful of Dagatan, Taysan, Batangas. Guided by the teachings of
              Christ and inspired by the life of St. Lorenzo Ruiz, the parish
              continues to foster a community rooted in faith, compassion, and
              service.
            </p>

            <p className="mt-5 leading-8 text-gray-600">
              The parish provides sacramental celebrations, spiritual formation,
              and pastoral programs that strengthen the relationship between God
              and His people while promoting unity among the community.
            </p>

            {/* Information Cards */}
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#FAF7F2] p-5">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#B22222] text-white">
                  <MapPin size={22} />
                </div>

                <h4 className="font-semibold text-[#222]">Location</h4>

                <p className="mt-2 text-sm text-gray-600">
                  Dagatan, Taysan, Batangas, Philippines
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF7F2] p-5">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37] text-white">
                  <CalendarDays size={22} />
                </div>

                <h4 className="font-semibold text-[#222]">Patron Saint</h4>

                <p className="mt-2 text-sm text-gray-600">St. Lorenzo Ruiz</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
