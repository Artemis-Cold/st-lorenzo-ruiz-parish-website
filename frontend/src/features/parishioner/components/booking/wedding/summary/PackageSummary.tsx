import { CheckCircle2 } from "lucide-react";

import { BookingCard } from "../..";
import type { ServicePackage } from "../../../../../../services/servicePackageService";

interface Props {
  selectedPackage: ServicePackage | null;
  selectedAddonIds: number[];
}

export default function PackageSummary({
  selectedPackage,
  selectedAddonIds,
}: Props) {
  if (!selectedPackage) {
    return (
      <BookingCard title="Wedding Fees">
        <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center text-gray-500">
          Wedding inclusions are unavailable.
        </div>
      </BookingCard>
    );
  }

  const selectedAddons = selectedPackage.addons.filter((addon) =>
    selectedAddonIds.includes(addon.id),
  );
  const total =
    Number(selectedPackage.base_price) +
    selectedPackage.inclusions.reduce(
      (sum, inclusion) => sum + Number(inclusion.price),
      0,
    ) +
    selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);

  return (
    <BookingCard title="Wedding Fees">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#B22222]">
                Included Wedding Services
              </h3>
              <p className="text-sm text-gray-500">
                {selectedPackage.inclusions.length} standard inclusions
                {selectedAddons.length > 0 &&
                  ` · ${selectedAddons.length} optional add-on${selectedAddons.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-[#B22222]">
            ₱{total.toLocaleString()}
          </span>
        </div>

        <div className="mt-5 grid gap-2 border-t border-gray-200 pt-4 sm:grid-cols-2">
          {selectedPackage.inclusions.map((inclusion) => (
            <div key={inclusion.id} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 size={15} className="shrink-0 text-green-600" />
              <span>{inclusion.name}</span>
            </div>
          ))}
          {selectedAddons.map((addon) => (
            <div key={addon.id} className="flex items-center gap-2 text-sm font-medium text-[#B22222]">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{addon.name}</span>
            </div>
          ))}
        </div>
      </div>
    </BookingCard>
  );
}
