import {
  Baby,
  HeartHandshake,
  Church,
  ScrollText,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ServiceRequirementsModal from "./ServiceRequirementsModal";

const services = [
  {
    icon: Baby,
    title: "Baptism",
    description:
      "Schedule baptism appointments online, submit documentary requirements, and receive updates about seminar schedules and appointment status.",
    color: "bg-sky-100 text-sky-600",
    path: "/services/baptism",
    requirements: [
      "Birth Certificate of the child to be baptized",
      "Baptism Permit when outside the parish jurisdiction",
      "Certificate of No Record of Baptism for adult baptism (7 years old and above)",
      "Godparents' Marriage Contract if married in church, or Confirmation Certificate if unmarried in church",
    ],
  },
  {
    icon: HeartHandshake,
    title: "Wedding",
    description:
      "Reserve wedding dates, upload requirements, and receive notifications for interviews, seminars, and document verification.",
    color: "bg-rose-100 text-rose-600",
    path: "/services/wedding",
    requirements: [
      "Marriage License from the City Hall Civil Registrar",
      "Certificate of No Marriage (CENOMAR)",
      "Baptismal Certificate for marriage purposes",
      "Confirmation Certificate for marriage purposes",
      "Interview / Canonical Investigation and Four Pillars Pre-Cana Seminar when baptism or confirmation is still required",
      "Permission of Parish and Publication of Banns when coming from another parish",
      "Three copies of a 3R portrait photo showing the bride and groom together",
      "Principal sponsors' Marriage Contract or Confirmation Certificate",
    ],
  },
  {
    icon: Church,
    title: "Funeral Services",
    description:
      "Coordinate funeral masses and burial services while communicating efficiently with the parish office.",
    color: "bg-violet-100 text-violet-600",
    path: "/services/funeral",
    requirements: [
      "Death Certificate",
      "Written Memorial Biography honoring the deceased",
    ],
  },
  {
    icon: ScrollText,
    title: "Mass Intentions",
    description:
      "Offer Mass intentions for thanksgiving, healing, birthdays, anniversaries, and prayers for departed loved ones.",
    color: "bg-amber-100 text-amber-600",
    path: "/services/mass-intention",
    requirements: [
      "GCash payment reference number",
      "Clear photo or PDF of the GCash payment receipt",
    ],
  },
  {
    icon: FileText,
    title: "Parish Documents",
    description:
      "Request baptismal, confirmation, marriage, and other parish certificates while tracking your request status online.",
    color: "bg-emerald-100 text-emerald-600",
    path: "/services/document-request",
    requirements: [
      "GCash payment reference number",
      "Clear photo or PDF of the GCash payment receipt",
    ],
  },
];

export default function Services() {
  const { isAuthenticated } = useAuth();
  const [selectedService, setSelectedService] = useState<
    (typeof services)[number] | null
  >(null);

  return (
    <section id="services" className="bg-[#F9FAFB] py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="mx-auto mb-7 max-w-3xl text-center">
          <span className="font-semibold uppercase tracking-[0.3em] text-[#B22222]">
            Parish Services
          </span>

          <h2 className="mt-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
            Serving the Community with Faith and Convenience
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-600 md:text-base">
            Access essential parish services online with a faster, more
            convenient, and organized way of connecting with St. Lorenzo Ruiz
            Parish.
          </p>

          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#D4AF37]" />
        </div>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="group flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${service.color}`}
                >
                  <Icon size={22} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-[#B22222]">
                  {service.title}
                </h3>

                <p className="mt-2 text-sm leading-5 text-gray-600">
                  {service.description}
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedService(service)}
                  className="mt-4 inline-flex self-start text-sm font-semibold text-[#B22222] transition-all group-hover:translate-x-1.5"
                >
                  View requirements →
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {selectedService && (
        <ServiceRequirementsModal
          service={selectedService}
          authenticated={isAuthenticated}
          onClose={() => setSelectedService(null)}
        />
      )}
    </section>
  );
}
