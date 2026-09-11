import { ChevronDown, History, Menu, Phone, X } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Announcements", href: "#announcements" },
  { label: "Holy Matrimony", href: "#holy-matrimony" },
  { label: "Monthly Schedule", href: "#schedule" },
  { label: "Services", href: "#services" },
];

const aboutItems = [
  { label: "History", href: "#history", icon: History },
  { label: "Contacts", href: "#contacts", icon: Phone },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  const scrollToSection = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();
    const section = document.querySelector(href);

    if (!section) return;

    setMobileOpen(false);
    setMobileAboutOpen(false);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", href);
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[#981B1B] bg-[#B22222]/95 shadow-lg backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
        <a
          href="#home"
          onClick={(event) => scrollToSection(event, "#home")}
          className="min-w-0 leading-tight text-white"
        >
          <span className="block truncate font-serif text-base font-bold tracking-wide xl:text-lg">
            St. Lorenzo Ruiz Parish
          </span>
          <span className="hidden text-[11px] text-red-100 xl:block">
            Dagatan, Taysan, Batangas
          </span>
        </a>

        <nav className="hidden items-center gap-3 lg:flex xl:gap-5">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(event) => scrollToSection(event, item.href)}
              className="whitespace-nowrap text-sm font-medium text-white transition duration-200 hover:text-[#F5D76E]"
            >
              {item.label}
            </a>
          ))}

          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 whitespace-nowrap py-5 text-sm font-medium text-white transition hover:text-[#F5D76E] focus-visible:outline-none focus-visible:text-[#F5D76E]"
              aria-haspopup="true"
            >
              About
              <ChevronDown
                size={15}
                className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
              />
            </button>

            <div className="invisible absolute right-0 top-[calc(100%-0.25rem)] w-48 translate-y-2 rounded-2xl border border-stone-200 bg-white p-2 opacity-0 shadow-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {aboutItems.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(event) => scrollToSection(event, item.href)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-red-50 hover:text-[#B22222]"
                  >
                    <Icon size={16} />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex xl:gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-white px-4 py-2 text-sm font-medium text-white transition duration-300 hover:bg-white hover:text-[#B22222]"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-medium text-white shadow-md transition duration-300 hover:bg-[#C9A227]"
          >
            Register
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="grid size-10 place-items-center rounded-xl text-white transition hover:bg-white/10 lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="max-h-[calc(100svh-4.5rem)] overflow-y-auto border-t border-red-900/15 bg-white shadow-xl lg:hidden">
          <div className="flex flex-col p-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(event) => scrollToSection(event, item.href)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-red-50 hover:text-[#B22222]"
              >
                {item.label}
              </a>
            ))}

            <button
              type="button"
              onClick={() => setMobileAboutOpen((open) => !open)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-stone-700 transition hover:bg-red-50 hover:text-[#B22222]"
              aria-expanded={mobileAboutOpen}
            >
              About
              <ChevronDown
                size={17}
                className={`transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`}
              />
            </button>

            {mobileAboutOpen && (
              <div className="mx-3 mb-2 grid gap-1 border-l-2 border-red-100 pl-3">
                {aboutItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(event) => scrollToSection(event, item.href)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-red-50 hover:text-[#B22222]"
                    >
                      <Icon size={16} /> {item.label}
                    </a>
                  );
                })}
              </div>
            )}

            <div className="grid gap-3 border-t border-stone-200 p-3 pt-4 sm:grid-cols-2">
              <Link
                to="/login"
                className="flex items-center justify-center rounded-xl border border-[#B22222] py-2.5 text-sm font-semibold text-[#B22222] transition hover:bg-[#B22222] hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center rounded-xl bg-[#B22222] py-2.5 text-sm font-semibold text-white transition hover:bg-[#981B1B]"
              >
                Register
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
