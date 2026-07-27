import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface AuthHeaderProps {
  backTo?: string;
  label?: string;
}

export default function AuthHeader({
  backTo = "/",
  label = "Back to Home",
}: AuthHeaderProps) {
  return (
    <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
      <Link
        to={backTo}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
      >
        <ArrowLeft size={18} />

        {/* Hide text on mobile */}
        <span className="hidden sm:inline text-sm font-medium">{label}</span>
      </Link>
    </div>
  );
}
