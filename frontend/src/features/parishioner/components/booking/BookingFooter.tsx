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
    <div className="mt-8 flex flex-col-reverse gap-3 sm:mt-10 sm:flex-row sm:justify-between">
      {previous && (
        <button
          type="button"
          onClick={previous}
          className="w-full rounded-xl border border-[#B22222] px-5 py-3 font-semibold text-[#B22222] transition hover:bg-[#B22222] hover:text-white sm:w-auto sm:px-8"
        >
          {previousText}
        </button>
      )}

      <button
        type="button"
        onClick={next}
        className="w-full rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white transition hover:bg-[#991B1B] sm:ml-auto sm:w-auto sm:px-8"
      >
        {nextText}
      </button>
    </div>
  );
}
