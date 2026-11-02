import SLRPAppContent from "@/features/ar-navigation/components/SLRPAppContent";

export default function SLRPAR() {
  return (
    <section
      id="slrp-ar"
      className="scroll-mt-20 bg-[#F9FAFB] py-12 md:py-14"
      aria-labelledby="slrp-ar-heading"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-7 max-w-3xl text-center">
          <span className="font-semibold uppercase tracking-[0.3em] text-[#B22222]">
            Explore the Parish
          </span>
          <h2
            id="slrp-ar-heading"
            className="mt-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl"
          >
            SLRP AR
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600 md:text-base">
            A little guidance for your visit to St. Lorenzo Ruiz Parish.
          </p>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#D4AF37]" />
        </div>
        <SLRPAppContent />
      </div>
    </section>
  );
}
