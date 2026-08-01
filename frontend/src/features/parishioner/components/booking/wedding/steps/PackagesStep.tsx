import { Check } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { BookingCard } from "../..";
import { addOns } from "../../../../data/packages";
import type { PackageItem } from "../../../../data/packages";
import type { WeddingBooking } from "../../../../types/wedding";

interface PackagesStepProps {
  booking: WeddingBooking;
  setBooking: Dispatch<SetStateAction<WeddingBooking>>;
}

export default function PackagesStep({
  booking,
  setBooking,
}: PackagesStepProps) {
  const toggleAddOn = (item: PackageItem) => {
    setBooking((prev) => {
      const exists = prev.package.addOns.some((addon) => addon.id === item.id);

      return {
        ...prev,
        package: {
          ...prev.package,
          addOns: exists
            ? prev.package.addOns.filter((addon) => addon.id !== item.id)
            : [...prev.package.addOns, item],
        },
      };
    });
  };

  const total =
    booking.package.inclusions.reduce((sum, item) => sum + item.price, 0) +
    booking.package.addOns.reduce((sum, item) => sum + item.price, 0);

  return (
    <BookingCard title="Wedding Package">
      <div className="space-y-8">
        {/* Included */}
        <div>
          <h3 className="mb-5 text-center text-xl font-bold text-[#B22222]">
            Included
          </h3>

          <div className="space-y-3">
            {booking.package.inclusions.map((item) => (
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
                  ₱{item.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Add-ons */}
        <div>
          <h3 className="mb-5 text-center text-xl font-bold text-[#B22222]">
            Optional Add-ons
          </h3>

          <div className="space-y-3">
            {addOns.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition hover:border-[#B22222]"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={booking.package.addOns.some(
                      (addon) => addon.id === item.id,
                    )}
                    onChange={() => toggleAddOn(item)}
                    className="h-5 w-5 accent-[#B22222]"
                  />

                  <span>{item.name}</span>
                </div>

                <span className="font-semibold">
                  ₱{item.price.toLocaleString()}
                </span>
              </label>
            ))}
          </div>
        </div>

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
