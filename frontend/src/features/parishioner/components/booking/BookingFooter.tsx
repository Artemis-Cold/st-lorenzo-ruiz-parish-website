interface Props {
  previous?: () => void;
  next?: () => void;
  previousText?: string;
  nextText?: string;
}

export default function BookingFooter({
  previous,
  next,
  previousText = "Previous",
  nextText = "Next",
}: Props) {
  return (
    <div className="mt-10 flex justify-between">
      <button
        onClick={previous}
        className="rounded-xl border border-[#B22222] px-8 py-3 font-semibold text-[#B22222] transition hover:bg-[#B22222] hover:text-white"
      >
        {previousText}
      </button>

      <button
        onClick={next}
        className="rounded-xl bg-[#B22222] px-8 py-3 font-semibold text-white transition hover:bg-[#991B1B]"
      >
        {nextText}
      </button>
    </div>
  );
}
