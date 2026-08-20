import { useEffect, useState } from "react";
import { Check, CircleHelp, Cross, Music2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { BookingCard } from "../..";
import {
  getServicePackages,
  type ServicePackage,
} from "../../../../../../services/servicePackageService";
import type { FuneralBooking } from "../../../../types/funeral";

interface Props {
  booking: FuneralBooking;
  setBooking: Dispatch<SetStateAction<FuneralBooking>>;
  selectedPackage: ServicePackage | null;
  setSelectedPackage: Dispatch<SetStateAction<ServicePackage | null>>;
}

export default function PackagesStep(props: Props) {
  const { booking, setBooking, selectedPackage, setSelectedPackage } = props;
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServicePackages("funeral")
      .then(setPackages)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedPackage || booking.service_package_id === 0) return;
    const match = packages.find((item) => item.id === booking.service_package_id);
    if (match) setSelectedPackage(match);
  }, [booking.service_package_id, packages, selectedPackage, setSelectedPackage]);

  if (loading) {
    return <BookingCard title="Packages">Loading packages...</BookingCard>;
  }

  return (
    <BookingCard title="Packages" contentClassName="p-4 sm:p-8">
      <div className="space-y-5 sm:space-y-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {packages.map((item) => {
            const selected = booking.service_package_id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setBooking((previous) => ({
                    ...previous,
                    service_package_id: item.id,
                    selected_addon_ids: [],
                  }));
                  setSelectedPackage(item);
                }}
                className={
                  "relative overflow-hidden rounded-2xl border transition-all " +
                  (selected
                    ? "border-[#B22222] bg-red-50 ring-2 ring-[#B22222]"
                    : "border-red-200 hover:border-[#B22222]")
                }
              >
                {item.recommended && (
                  <div className="absolute left-2 right-2 top-0 rounded-b-lg bg-[#B22222] py-1 text-[10px] font-semibold text-white sm:left-4 sm:right-4 sm:rounded-b-xl sm:text-xs">
                    Recommended
                  </div>
                )}
                {selected && (
                  <div className="absolute right-2 top-2 rounded-full bg-[#B22222] p-1.5 text-white sm:right-4 sm:top-4 sm:p-2">
                    <Check className="size-3.5 sm:size-4" />
                  </div>
                )}
                <div className="px-2.5 pb-4 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
                  <div className="flex flex-col items-center justify-center gap-1.5 sm:flex-row sm:gap-4">
                    {item.name === "With Choir" ? (
                      <Music2 className="size-7 shrink-0 text-[#B22222] sm:size-12" />
                    ) : (
                      <Cross className="size-7 shrink-0 text-[#B22222] sm:size-12" />
                    )}
                    <h2 className="min-h-10 text-center text-base font-medium leading-5 text-[#B22222] sm:min-h-0 sm:text-left sm:text-3xl sm:font-light sm:leading-normal">
                      {item.name}
                    </h2>
                  </div>
                  <div className="my-3 border-b border-red-300 sm:my-5" />
                  <p className="text-xs text-[#B22222] sm:text-lg">From</p>
                  <p className="text-xl font-semibold text-[#B22222] sm:text-5xl sm:font-light">
                    ₱{Number(item.base_price).toLocaleString()}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="max-w-xl rounded-2xl border border-red-200 p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-red-50 sm:size-14">
              <CircleHelp className="size-6 text-[#B22222] sm:size-8" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold sm:text-2xl">Need help choosing?</h3>
              <p className="mt-1 text-sm leading-5 text-[#B22222] sm:text-base">
                Contact the Parish Office for assistance with your package.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BookingCard>
  );
}
