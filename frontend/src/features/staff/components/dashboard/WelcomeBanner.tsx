import { useAuth } from "@/contexts/AuthContext";

export default function WelcomeBanner() {
  const { user } = useAuth();

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#B22222] px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/[0.06]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/[0.05]"
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            {greeting}
          </p>
          <h1 className="mt-2 font-serif text-2xl font-bold leading-tight sm:text-3xl">
            Welcome back, {user?.first_name ?? "Admin"}
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/75 sm:text-base">
            Manage church services, listings, and requests from this dashboard.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-start rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
          <span className="text-white/70">
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
