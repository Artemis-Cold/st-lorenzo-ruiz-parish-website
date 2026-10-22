import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function SettingsPageHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <header className="overflow-hidden rounded-3xl bg-linear-to-br from-[#B22222] to-[#741515] px-7 py-8 text-white shadow-lg sm:px-10">
      <Link
        to="/staff/settings"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition hover:text-white"
      >
        <ArrowLeft size={17} /> Back to Settings
      </Link>
      <div className="flex items-start gap-4 sm:items-center">
        <div className="shrink-0 rounded-2xl bg-white/15 p-3">
          <Icon size={27} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F5D76E]">
            Parish configuration
          </p>
          <h1 className="mt-1 break-words font-serif text-3xl font-bold">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/75">{description}</p>
        </div>
      </div>
    </header>
  );
}
