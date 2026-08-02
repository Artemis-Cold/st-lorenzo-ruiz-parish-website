import {
  Check,
  CircleHelp,
  Music2,
  Cross,
} from "lucide-react";

import type { Dispatch, SetStateAction } from "react";

import { BookingCard } from "../..";

import { funeralPackages } from "../../../../data/packages";

import type { FuneralBooking } from "../../../../types/funeral";
import type { FuneralPackage } from "../../../../data/packages";

interface PackagesStepProps {
  booking: FuneralBooking;
  setBooking: Dispatch<SetStateAction<FuneralBooking>>;
}

export default function PackagesStep({
  booking,
  setBooking,
}: PackagesStepProps) {
  const selectPackage = (pkg: FuneralPackage) => {
    setBooking((prev) => ({
      ...prev,
      package: pkg,
    }));
  };

  return (
    <BookingCard title="Packages">
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {funeralPackages.map((pkg) => {
            const selected = booking.package?.id === pkg.id;

            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => selectPackage(pkg)}
                className={`
                  relative overflow-hidden rounded-2xl border transition-all
                  ${
                    selected
                      ? "border-[#B22222] bg-red-50 ring-2 ring-[#B22222]"
                      : "border-red-200 hover:border-[#B22222]"
                  }
                `}
              >
                {pkg.recommended && (
                  <div className="absolute left-4 right-4 top-0 rounded-b-xl bg-[#B22222] py-1 text-center text-xs font-semibold text-white">
                    Recommended
                  </div>
                )}

                {selected && (
                  <div className="absolute right-4 top-4 rounded-full bg-[#B22222] p-2 text-white">
                    <Check size={16} />
                  </div>
                )}

                <div className="px-8 pb-8 pt-10">
                  <div className="flex items-center justify-center gap-4">
                    {pkg.name === "With Choir" ? (
                      <Music2
                        size={48}
                        className="text-[#B22222]"
                      />
                    ) : (
                      <Cross
                        size={48}
                        className="text-[#B22222]"
                      />
                    )}

                    <h2 className="text-3xl font-light text-[#B22222]">
                      {pkg.name}
                    </h2>
                  </div>

                  <div className="my-5 border-b border-red-300" />

                  <p className="text-lg text-[#B22222]">
                    From
                  </p>

                  <p className="text-5xl font-light text-[#B22222]">
                    ₱{pkg.price.toLocaleString()}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="max-w-xl rounded-2xl border border-red-200 p-6">
          <div className="flex gap-4">
            <div className="rounded-full bg-red-50 p-3">
              <CircleHelp
                size={36}
                className="text-[#B22222]"
              />
            </div>

            <div>
              <h3 className="text-2xl font-semibold">
                Need help choosing?
              </h3>

              <p className="mt-1 text-[#B22222]">
                Contact the Parish Office for assistance with your package.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BookingCard>
  );
}