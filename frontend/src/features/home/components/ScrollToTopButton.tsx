import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 500);

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      title="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#B22222] text-white shadow-[0_10px_30px_rgba(104,20,20,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#941C1C] hover:shadow-[0_14px_34px_rgba(104,20,20,0.4)] focus:outline-none focus:ring-4 focus:ring-[#B22222]/20 sm:right-6 ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-90 opacity-0"
      }`}
    >
      <ChevronUp size={23} strokeWidth={2.5} />
    </button>
  );
}
