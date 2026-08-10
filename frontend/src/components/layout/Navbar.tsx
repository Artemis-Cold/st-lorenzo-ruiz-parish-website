import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/images/parish-logo.png";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Announcements", href: "#announcements" },
  { label: "Monthly Schedule", href: "#schedule" },
  { label: "Services", href: "#services" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-[#981B1B] bg-[#B22222]/95 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <a href="#hero" className="flex min-w-0 items-center gap-3">
          <img
            src={logo}
            alt="St. Lorenzo Ruiz Parish Logo"
            className="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover shadow-md"
          />

          <div className="min-w-0 leading-tight">
            <h1 className="truncate font-serif text-lg font-bold tracking-wide text-white xl:text-xl">
              St. Lorenzo Ruiz Parish
            </h1>

            {/* Only show on extra large screens */}
            <p className="hidden text-xs text-red-100 xl:block">
              Dagatan, Taysan, Batangas, Philippines
            </p>

            {/* Show shorter location on large screens */}
            <p className="hidden text-xs text-red-100 lg:block xl:hidden">
              Dagatan, Batangas
            </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-medium text-white transition duration-200 hover:text-[#D4AF37]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/login"
            className="rounded-xl border border-white px-5 py-2 font-medium text-white transition duration-300 hover:bg-white hover:text-[#B22222]"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-[#D4AF37] px-5 py-2 font-medium text-white shadow-md transition duration-300 hover:bg-[#C9A227]"
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <nav className="border-t border-gray-200 bg-white shadow-xl lg:hidden">
          <div className="flex flex-col">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-6 py-4 font-medium text-gray-700 transition hover:bg-gray-50 hover:text-[#B22222]"
              >
                {item.label}
              </a>
            ))}

            <div className="space-y-3 border-t border-gray-200 p-5">
              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-xl border border-[#B22222] py-2 font-medium text-[#B22222] transition hover:bg-[#B22222] hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="flex w-full items-center justify-center rounded-xl bg-[#B22222] py-2 font-medium text-white no-underline transition hover:bg-[#981B1B]"
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
