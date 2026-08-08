import type { Dispatch, SetStateAction } from "react";

import { BookingCard } from "../..";

import { useEffect, useState } from "react";

import {
  getServicePackages,
  type ServicePackage,
} from "../../../../../../services/servicePackageService";

import type { BaptismBooking } from "../../../../types/baptism";

interface PackagesStepProps {
  booking: BaptismBooking;
  setBooking: Dispatch<SetStateAction<BaptismBooking>>;
  selectedDate: Date | null;
  selectedPackage: ServicePackage | null;
  setSelectedPackage: Dispatch<SetStateAction<ServicePackage | null>>;
}

export default function PackagesStep({
  booking,
  setBooking,
  selectedDate,
  selectedPackage,
  setSelectedPackage,
}: PackagesStepProps) {
  const [packages, setPackages] = useState<ServicePackage[]>([]);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await getServicePackages("baptism");
        setPackages(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadPackages();
  }, []);

  const isSunday = selectedDate ? selectedDate.getDay() === 0 : null;

  const relevantPackages =
    isSunday === null
      ? packages
      : packages.filter((pkg) =>
          isSunday
            ? pkg.name.toLowerCase().includes("sunday")
            : !pkg.name.toLowerCase().includes("sunday"),
        );

  // If the previously selected package no longer matches the chosen date
  // (e.g. user picked a package, went back, changed the date), clear it.
  useEffect(() => {
    if (booking.service_package_id === 0) return;

    const stillValid = relevantPackages.some(
      (pkg) => pkg.id === booking.service_package_id,
    );

    if (!stillValid) {
      setBooking((prev) => ({ ...prev, service_package_id: 0 }));
      setSelectedPackage(null);
    }
  }, [selectedDate, packages]);

  // If selectedPackage was lost on remount (e.g. navigated away and back)
  // but booking.service_package_id still points at a valid package once
  // the list has loaded, restore it so PackageSummary isn't left blank.
  useEffect(() => {
    if (selectedPackage || booking.service_package_id === 0) return;

    const match = packages.find((pkg) => pkg.id === booking.service_package_id);

    if (match) {
      setSelectedPackage(match);
    }
  }, [packages]);

  const selectPackage = (pkg: ServicePackage) => {
    setBooking((prev) => ({
      ...prev,
      service_package_id: pkg.id,
    }));

    setSelectedPackage(pkg);
  };

  return (
    <BookingCard title="Packages">
      <div className="space-y-8">
        <div>
          <h3 className="mb-6 text-2xl font-bold">Baptismal Rates</h3>

          {selectedDate && (
            <p className="mb-4 text-sm text-gray-500">
              Showing rates for{" "}
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}

          <div className="space-y-4">
            {relevantPackages.map((pkg) => (
              <label
                key={pkg.id}
                className={`
              flex cursor-pointer items-center justify-between
              rounded-xl border p-5 transition

              ${
                booking.service_package_id === pkg.id
                  ? "border-[#B22222] bg-red-50"
                  : "border-gray-200 hover:border-[#B22222]"
              }
            `}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    checked={booking.service_package_id === pkg.id}
                    onChange={() => selectPackage(pkg)}
                    className="h-5 w-5 accent-[#B22222]"
                  />

                  <span className="text-lg">{pkg.name}</span>
                </div>

                <span className="text-2xl font-semibold text-[#B22222]">
                  ₱{Number(pkg.base_price).toLocaleString()}
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
