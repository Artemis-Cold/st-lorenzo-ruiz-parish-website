interface BookingHeaderProps {
  title: string;
  subtitle: string;
}

export default function BookingHeader({ title, subtitle }: BookingHeaderProps) {
  return (
    <section className="min-w-0 rounded-2xl bg-[#C62828] px-5 py-6 text-white shadow-lg sm:px-8 sm:py-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl leading-tight font-bold uppercase [overflow-wrap:anywhere] sm:text-3xl lg:text-4xl">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-red-100 [overflow-wrap:anywhere] sm:text-base">
            {subtitle}
          </p>
        </div>

        <div
          aria-hidden="true"
          className="hidden shrink-0 text-7xl opacity-20 md:block"
        >
          ✝
        </div>
      </div>
    </section>
  );
}
