import { AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";

interface AlertBannerProps {
  message: string;
  errors?: Record<string, string[]>;
}

export default function AlertBanner({ message, errors }: AlertBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasFieldErrors = Object.values(errors ?? {}).some(
    (messages) => messages.length > 0,
  );
  const focusFirst = () => {
    const scope = ref.current?.parentElement;
    const field = scope?.querySelector<HTMLElement>(
      '[aria-invalid="true"]:not([readonly]):not([disabled])',
    );
    const target =
      field ??
      scope?.querySelector<HTMLElement>("[data-booking-field-error]") ??
      ref.current;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      ref.current?.focus({ preventScroll: true });
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [message, errors]);
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="flex scroll-mt-24 items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 outline-none focus:ring-2 focus:ring-red-600"
    >
      <AlertCircle
        aria-hidden="true"
        className="mt-0.5 h-5 w-5 flex-shrink-0"
      />
      <div className="min-w-0">
        <p className="font-semibold">{message}</p>
        {hasFieldErrors && (
          <>
            <p lang="tl" className="mt-1 text-sm">
              Pakisuri ang mga field na may markang mali.
            </p>
            <button
              type="button"
              onClick={focusFirst}
              className="mt-3 rounded-lg border border-red-700 px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Go to first error / Pumunta sa unang mali
            </button>
          </>
        )}
      </div>
    </div>
  );
}
