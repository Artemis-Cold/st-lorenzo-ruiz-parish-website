
import type { Dispatch, SetStateAction } from "react";

import { BookingCard } from "../..";

import { baptismPackages } from "../../../../data/packages";

import type { BaptismBooking } from "../../../../types/baptism";
import type { BaptismPackage } from "../../../../data/packages";

interface PackagesStepProps {
  booking: BaptismBooking;
  setBooking: Dispatch<SetStateAction<BaptismBooking>>;
}

export default function PackagesStep({
  booking,
  setBooking,
}: PackagesStepProps) {
  const selectPackage = (pkg: BaptismPackage) => {
    setBooking((prev) => ({
      ...prev,
      package: pkg,
    }));
  };

  return (
    <BookingCard title="Packages">
      <div className="space-y-8">
        <div>
          <h3 className="mb-6 text-2xl font-bold">Baptismal Rates</h3>

          <div className="space-y-4">
            {baptismPackages.map((pkg) => (
              <label
                key={pkg.id}
                className={`
              flex cursor-pointer items-center justify-between
              rounded-xl border p-5 transition

              ${
                booking.package?.id === pkg.id
                  ? "border-[#B22222] bg-red-50"
                  : "border-gray-200 hover:border-[#B22222]"
              }
            `}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    checked={booking.package?.id === pkg.id}
                    onChange={() => selectPackage(pkg)}
                    className="h-5 w-5 accent-[#B22222]"
                  />

                  <span className="text-lg">{pkg.name}</span>
                </div>

                <span className="text-2xl font-semibold text-[#B22222]">
                  ₱{pkg.price.toLocaleString()}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h4 className="mb-3 text-center font-bold italic text-[#B22222]">
            Note
          </h4>

          <p className="text-center italic text-[#B22222]">
            The package rate includes <b>one pair</b> of sponsors (2 persons).
          </p>

          <p className="text-center italic text-[#B22222]">
            Additional sponsors are charged
            <b> ₱100 per person.</b>
          </p>

          <p className="mt-5 text-center italic text-[#B22222]">
            If you have any questions, please visit the parish office or call
            <b> 0917-516-6757.</b>
          </p>
        </div>
      </div>
    </BookingCard>
  );
}
