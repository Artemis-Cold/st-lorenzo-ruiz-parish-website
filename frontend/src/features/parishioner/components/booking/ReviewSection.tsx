import type { ReactNode } from "react";
import { BookingTranslation } from "./BookingLabel";
import { validationLabel } from "@/utils/validationLabels";
import { reviewValue } from "./reviewValue";

const labels: Record<string, string> = {
  middle_initial: "MI",
  birth_date: "Birthday",
  birth_place: "Place of Birth",
  requirement_type: "Certificate to Submit",
  baptism_date: "Date of Baptism",
  baptism_church: "Baptized In",
  parish_origin: "Parish of Origin",
  has_spouse: "Has Spouse",
  attends_mass: "Mass Attendance",
  confesses: "Confession",
  anointed_of_the_sick: "Anointing of the Sick",
};

export function ReviewDetails({ data }: { data: unknown }) {
  if (Array.isArray(data))
    return data.length ? (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="rounded-xl border border-gray-200 p-3">
            <p className="mb-2 text-sm font-semibold text-[#B22222]">
              {index + 1}
            </p>
            <ReviewDetails data={item} />
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-600">None listed / Walang nakalista</p>
    );
  if (
    data &&
    typeof data === "object" &&
    !(data instanceof Date) &&
    !(typeof File !== "undefined" && data instanceof File)
  ) {
    return (
      <dl className="grid min-w-0 gap-x-6 gap-y-4 sm:grid-cols-2">
        {Object.entries(data).map(([key, value]) => {
          const nested =
            value &&
            typeof value === "object" &&
            !(value instanceof Date) &&
            !(typeof File !== "undefined" && value instanceof File);
          const label =
            labels[key] ?? validationLabel(key.replaceAll("_", " "));
          return (
            <div
              key={key}
              className={nested ? "min-w-0 sm:col-span-2" : "min-w-0"}
            >
              <dt className="mb-1 text-sm text-gray-500">
                {label}
                <BookingTranslation text={label} />
              </dt>
              <dd className="whitespace-pre-wrap break-words text-sm font-medium text-gray-900">
                {nested ? <ReviewDetails data={value} /> : reviewValue(value)}
              </dd>
            </div>
          );
        })}
      </dl>
    );
  }
  return <p className="break-words text-sm">{reviewValue(data)}</p>;
}

export default function ReviewSection({
  title,
  onEdit,
  data,
  children,
}: {
  title: string;
  onEdit?: () => void;
  data?: unknown;
  children?: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#E7E2DA] bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900">
          {title}
          <BookingTranslation text={title} />
        </h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${title}`}
            className="shrink-0 rounded-lg border border-[#B22222] px-3 py-2 text-sm font-semibold text-[#B22222] hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Edit / Baguhin
          </button>
        )}
      </div>
      {data !== undefined && <ReviewDetails data={data} />}
      {children}
    </section>
  );
}
