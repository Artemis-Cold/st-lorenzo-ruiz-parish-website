interface BookingHeaderProps {
  title: string;
  subtitle: string;
}

export default function BookingHeader({ title, subtitle }: BookingHeaderProps) {
  return (
    <section className="rounded-2xl bg-[#C62828] px-8 py-8 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold uppercase">{title}</h1>

          <p className="mt-2 text-red-100">{subtitle}</p>
        </div>

        <div className="hidden text-7xl opacity-20 md:block">✝</div>
      </div>
    </section>
  );
}
