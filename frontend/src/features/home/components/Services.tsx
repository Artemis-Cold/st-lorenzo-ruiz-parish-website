import {
  Baby,
  HeartHandshake,
  Church,
  ScrollText,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Baby,
    title: "Baptism",
    description:
      "Schedule baptism appointments online, submit documentary requirements, and receive updates about seminar schedules and appointment status.",
    color: "bg-sky-100 text-sky-600",
    path: "/services/baptism",
  },
  {
    icon: HeartHandshake,
    title: "Wedding",
    description:
      "Reserve wedding dates, upload requirements, and receive notifications for interviews, seminars, and document verification.",
    color: "bg-rose-100 text-rose-600",
    path: "/services/wedding",
  },
  {
    icon: Church,
    title: "Funeral Services",
    description:
      "Coordinate funeral masses and burial services while communicating efficiently with the parish office.",
    color: "bg-violet-100 text-violet-600",
    path: "/services/funeral",
  },
  {
    icon: ScrollText,
    title: "Mass Intentions",
    description:
      "Offer Mass intentions for thanksgiving, healing, birthdays, anniversaries, and prayers for departed loved ones.",
    color: "bg-amber-100 text-amber-600",
    path: "/services/mass-intention",
  },
  {
    icon: FileText,
    title: "Parish Documents",
    description:
      "Request baptismal, confirmation, marriage, and other parish certificates while tracking your request status online.",
    color: "bg-emerald-100 text-emerald-600",
    path: "/services/document-request",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-[#F9FAFB] py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="font-semibold uppercase tracking-[0.3em] text-[#B22222]">
            Parish Services
          </span>

          <h2 className="mt-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
            Serving the Community with Faith and Convenience
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Access essential parish services online with a faster, more
            convenient, and organized way of connecting with St. Lorenzo Ruiz
            Parish.
          </p>

          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[#D4AF37]" />
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="group rounded-3xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${service.color}`}
                >
                  <Icon size={30} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-[#B22222]">
                  {service.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-600">
                  {service.description}
                </p>

                <Link to="/login" state={{ redirectTo: service.path }} className="mt-8 inline-flex font-semibold text-[#B22222] transition-all group-hover:translate-x-2">Book this service →</Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
