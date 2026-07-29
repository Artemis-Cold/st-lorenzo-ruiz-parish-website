import church from "@/assets/images/church.png";

export default function WelcomeBanner() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-cover bg-center shadow-lg"
      style={{
        backgroundImage: `url(${church})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/45 to-black/20" />

      <div className="relative z-10 flex min-h-[60] flex-col justify-center px-10 py-10 text-white">
        <span className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
          Welcome
        </span>

        <h1 className="font-serif text-4xl font-bold">Welcome Back, Juan!</h1>

        <p className="mt-4 max-w-xl text-gray-200">
          Manage parish service bookings, monitor your requests, receive
          announcements, and stay connected with parish activities.
        </p>
      </div>
    </section>
  );
}
