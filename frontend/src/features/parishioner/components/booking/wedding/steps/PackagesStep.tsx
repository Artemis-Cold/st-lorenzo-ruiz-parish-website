import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { BookingCard } from "../..";
import {
  getServicePackages,
  type ServicePackage,
} from "../../../../../../services/servicePackageService";
import type { WeddingBooking } from "../../../../types/wedding";

interface PackagesStepProps {
  booking: WeddingBooking;
  setBooking: Dispatch<SetStateAction<WeddingBooking>>;
  selectedPackage: ServicePackage | null;
  setSelectedPackage: Dispatch<SetStateAction<ServicePackage | null>>;
}

export default function PackagesStep({
  booking,
  setBooking,
  selectedPackage,
  setSelectedPackage,
}: PackagesStepProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPackages = async () => {
      try {
        const data = await getServicePackages("wedding");
        if (!active) return;

        const defaultPackage =
          data.find((pkg) => pkg.recommended) ?? data[0] ?? null;

        if (!defaultPackage) {
          setLoadError(true);
          return;
        }

        setSelectedPackage(defaultPackage);
        setBooking((previous) =>
          previous.service_package_id === defaultPackage.id
            ? previous
            : {
                ...previous,
                service_package_id: defaultPackage.id,
                selected_addon_ids: [],
              },
        );
      } catch (error) {
        console.error(error);
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPackages();

    return () => {
      active = false;
    };
  }, [setBooking, setSelectedPackage]);

  const toggleAddOn = (addonId: number) => {
    setBooking((prev) => {
      const exists = prev.selected_addon_ids.includes(addonId);

      return {
        ...prev,
        selected_addon_ids: exists
          ? prev.selected_addon_ids.filter((id) => id !== addonId)
          : [...prev.selected_addon_ids, addonId],
      };
    });
  };

  const total = selectedPackage
    ? Number(selectedPackage.base_price) +
      selectedPackage.inclusions.reduce(
        (sum, item) => sum + Number(item.price),
        0,
      ) +
      selectedPackage.addons
        .filter((addon) => booking.selected_addon_ids.includes(addon.id))
        .reduce((sum, item) => sum + Number(item.price), 0)
    : 0;

  if (loading) {
    return (
      <BookingCard title="Wedding Fees & Add-ons">
        <div className="rounded-2xl border py-10 text-center text-gray-500">
          Loading wedding inclusions...
        </div>
      </BookingCard>
    );
  }

  if (loadError || !selectedPackage) {
    return (
      <BookingCard title="Wedding Fees & Add-ons">
        <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 py-10 text-center text-red-600">
          Wedding inclusions are currently unavailable. Please try again.
        </div>
      </BookingCard>
    );
  }

  return (
    <BookingCard title="Wedding Fees & Add-ons">
      <div className="space-y-8">
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-center">
          <p className="font-semibold text-[#B22222]">
            Parish wedding inclusions are automatically included.
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Review the standard fees below and select optional add-ons if needed.
          </p>
        </div>

        {/* Included */}
            {selectedPackage.inclusions.length > 0 && (
              <div>
                <h3 className="mb-5 text-center text-xl font-bold text-[#B22222]">
                  Included
                </h3>

                <div className="space-y-3">
                  {selectedPackage.inclusions.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded bg-[#B22222] p-1 text-white">
                          <Check size={16} />
                        </div>

                        <span>{item.name}</span>
                      </div>

                      <span className="font-semibold text-[#B22222]">
                        ₱{Number(item.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Add-ons */}
            {selectedPackage.addons.length > 0 && (
              <div>
                <h3 className="mb-5 text-center text-xl font-bold text-[#B22222]">
                  Optional Add-ons
                </h3>

                <div className="space-y-3">
                  {selectedPackage.addons.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition hover:border-[#B22222]"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={booking.selected_addon_ids.includes(item.id)}
                          onChange={() => toggleAddOn(item.id)}
                          className="h-5 w-5 accent-[#B22222]"
                        />

                        <span>{item.name}</span>
                      </div>

                      <span className="font-semibold">
                        ₱{Number(item.price).toLocaleString()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="rounded-2xl bg-[#B22222] p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold">Total Package</span>

                <span className="text-3xl font-bold">
                  ₱{total.toLocaleString()}
                </span>
              </div>
            </div>
      </div>
    </BookingCard>
  );
}
