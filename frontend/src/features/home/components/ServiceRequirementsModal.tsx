import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { ComponentType } from "react";

interface Props {
  service: {
    title: string;
    path: string;
    requirements: string[];
    icon: ComponentType<{ size?: number }>;
    color: string;
  };
  authenticated: boolean;
  onClose: () => void;
}

export default function ServiceRequirementsModal({
  service,
  authenticated,
  onClose,
}: Props) {
  const navigate = useNavigate();
  const Icon = service.icon;

  const book = () => {
    onClose();
    navigate(authenticated ? service.path : "/login", {
      state: authenticated ? undefined : { redirectTo: service.path },
    });
  };

  return (
    <div
      data-app-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        data-modal-scroll="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-requirements-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${service.color}`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B22222]">
                Before you book
              </p>
              <h2 id="service-requirements-title" className="mt-1 font-serif text-2xl font-bold text-[#292524]">
                {service.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close requirements"
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-6 text-sm leading-6 text-gray-600">
          Please prepare the following requirements before starting your
          {` ${service.title.toLowerCase()} request`}.
        </p>

        <ul className="mt-5 space-y-3">
          {service.requirements.map((requirement) => (
            <li key={requirement} className="flex items-start gap-3 rounded-xl bg-[#FAF8F5] px-4 py-3 text-sm leading-5 text-gray-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Check size={13} strokeWidth={3} />
              </span>
              <span>{requirement}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#E7E2DA] px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={book}
            className="rounded-xl bg-[#B22222] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8B1C1C]"
          >
            {authenticated ? "Book this service" : "Login to book"}
          </button>
        </div>
      </div>
    </div>
  );
}
