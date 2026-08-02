import { Check } from "lucide-react";

import { BookingCard } from "../../";
import type { WeddingBooking } from "../../../../types/wedding";

interface Props {
  booking: WeddingBooking;
}

export default function PackageSummary({ booking }: Props) {
  const total = [
    ...booking.package.inclusions,
    ...booking.package.addOns,
  ].reduce((sum, item) => sum + item.price, 0);

  return (
    <BookingCard title="Selected Package">

      <div className="space-y-8">

        <div>
          <h3 className="mb-4 text-lg font-semibold text-[#B22222]">
            Included
          </h3>

          <div className="space-y-3">
            {booking.package.inclusions.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <Check size={18} className="text-green-600" />

                  {item.name}
                </div>

                <span>₱{item.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-[#B22222]">
            Selected Add-ons
          </h3>

          {booking.package.addOns.length === 0 ? (
            <p className="text-gray-500">
              No add-ons selected.
            </p>
          ) : (
            <div className="space-y-3">
              {booking.package.addOns.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <span>{item.name}</span>

                  <span>
                    ₱{item.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[#B22222] p-5 text-white">
          <div className="flex justify-between">
            <span className="font-semibold">
              Total Package
            </span>

            <span className="text-2xl font-bold">
              ₱{total.toLocaleString()}
            </span>
          </div>
        </div>

      </div>
    </BookingCard>
  );
}