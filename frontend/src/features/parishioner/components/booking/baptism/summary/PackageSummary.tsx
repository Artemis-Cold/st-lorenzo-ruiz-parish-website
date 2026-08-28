import { CheckCircle2 } from "lucide-react";

import { BookingCard } from "../..";
import type { ServicePackage } from "../../../../../../services/servicePackageService";

interface Props {
  selectedPackage: ServicePackage | null;
  additionalSponsorCount?: number;
  additionalSponsorPrice?: number | null;
}

export default function PackageSummary({
  selectedPackage,
  additionalSponsorCount = 0,
  additionalSponsorPrice = 0,
}: Props) {
  if (!selectedPackage) {
    return (
      <BookingCard title="Selected Package">
        <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center text-gray-500">
          No package selected.
        </div>
      </BookingCard>
    );
  }

  const sponsorSubtotal =
    additionalSponsorCount * (additionalSponsorPrice ?? 0);
  const total = Number(selectedPackage.base_price) + sponsorSubtotal;

  return (
    <BookingCard title="Selected Package">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#B22222]">
                {selectedPackage.name}
              </h3>

              <p className="text-sm text-gray-500">
                Selected baptism service package
              </p>
            </div>
          </div>

          <span className="text-2xl font-bold text-[#B22222]">
            ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        {additionalSponsorCount > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-600">
            Additional sponsors: {additionalSponsorCount} ×{" "}
            {additionalSponsorPrice === null
              ? "rate unavailable"
              : `₱${additionalSponsorPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          </div>
        )}
      </div>
    </BookingCard>
  );
}
