import { CheckCircle2 } from "lucide-react";

import { BookingCard } from "../..";
import type { ServicePackage } from "../../../../../../services/servicePackageService";

interface Props {
  selectedPackage: ServicePackage | null;
}

export default function PackageSummary({ selectedPackage }: Props) {
  if (!selectedPackage) {
    return (
      <BookingCard title="Selected Package">
        <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center text-gray-500">
          No package selected.
        </div>
      </BookingCard>
    );
  }

  return (
    <BookingCard title="Selected Package">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#B22222]">
                {selectedPackage.name}
              </h3>
              <p className="text-sm text-gray-500">
                Selected wedding service package
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-[#B22222]">
            ₱{Number(selectedPackage.base_price).toLocaleString()}
          </span>
        </div>
      </div>
    </BookingCard>
  );
}
