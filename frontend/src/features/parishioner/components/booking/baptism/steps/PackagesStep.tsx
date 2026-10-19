import { BookingTranslation } from "@/features/parishioner/components/booking/BookingLabel";
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { BookingCard } from "../..";

import { Skeleton } from "@/components/ui/skeleton";
import {
  getServicePackages,
  type ServicePackage,
} from "../../../../../../services/servicePackageService";

import type { BaptismBooking } from "../../../../types/baptism";
import { formatPhpCurrency } from "@/utils/currency";

interface PackagesStepProps {
  booking: BaptismBooking;
  setBooking: Dispatch<SetStateAction<BaptismBooking>>;
  selectedDate: Date | null;
  selectedPackage: ServicePackage | null;
  setSelectedPackage: Dispatch<SetStateAction<ServicePackage | null>>;
  additionalSponsorPrice: number | null;
}

export default function PackagesStep({
  booking,
  setBooking,
  selectedDate,
  selectedPackage,
  setSelectedPackage,
  additionalSponsorPrice,
}: PackagesStepProps) {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPackages = async () => {
      try {
        const data = await getServicePackages("baptism");
        if (active) setPackages(data);
      } catch (error) {
        if (active) setError(true);
        console.error(error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadPackages();

    return () => {
      active = false;
    };
  }, []);

  const isSunday = selectedDate ? selectedDate.getDay() === 0 : null;

  const relevantPackages = useMemo(
    () =>
      isSunday === null
        ? packages
        : packages.filter(
            (pkg) => !pkg.name.toLowerCase().includes("sunday") || isSunday,
          ),
    [isSunday, packages],
  );

  // If the previously selected package no longer matches the chosen date
  // (e.g. user picked a package, went back, changed the date), clear it.
  useEffect(() => {
    if (loading || error || booking.service_package_id === 0) return;

    const stillValid = relevantPackages.some(
      (pkg) => pkg.id === booking.service_package_id,
    );

    if (!stillValid) {
      setBooking((prev) => ({ ...prev, service_package_id: 0 }));
      setSelectedPackage(null);
    }
  }, [
    booking.service_package_id,
    loading,
    error,
    relevantPackages,
    setBooking,
    setSelectedPackage,
  ]);

  // If selectedPackage was lost on remount (e.g. navigated away and back)
  // but booking.service_package_id still points at a valid package once
  // the list has loaded, restore it so PackageSummary isn't left blank.
  useEffect(() => {
    if (selectedPackage || booking.service_package_id === 0) return;

    const match = packages.find((pkg) => pkg.id === booking.service_package_id);

    if (match) {
      setSelectedPackage(match);
    }
  }, [
    booking.service_package_id,
    packages,
    selectedPackage,
    setSelectedPackage,
  ]);

  const selectPackage = (pkg: ServicePackage) => {
    setBooking((prev) => ({
      ...prev,
      service_package_id: pkg.id,
    }));

    setSelectedPackage(pkg);
  };

  if (loading) {
    return (
      <BookingCard title="Packages">
        <div
          aria-label="Loading baptism packages"
          aria-busy="true"
          className="grid gap-4 md:grid-cols-2"
        >
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </BookingCard>
    );
  }

  return (
    <BookingCard title="Packages">
      <div className="space-y-8">
        <div>
          <h3 className="mb-6 text-2xl font-bold">
            Choose Your Baptism Package
            <span
              lang="tl"
              className="mt-1 block text-sm font-normal text-gray-500"
            >
              Piliin ang inyong pakete para sa Binyag
            </span>
          </h3>

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
            {error && (
              <p role="alert" className="text-sm text-red-700">
                Unable to load packages. Please refresh to try again.
                <span lang="tl" className="block">
                  Hindi ma-load ang mga pakete. I-refresh ang pahina upang
                  subukang muli.
                </span>
              </p>
            )}
            {!error && relevantPackages.length === 0 && (
              <p className="text-sm text-gray-500">
                No packages are currently available. Please contact the parish
                office.
                <span lang="tl" className="block">
                  Walang available na pakete. Makipag-ugnayan sa opisina ng
                  parokya.
                </span>
              </p>
            )}
            {relevantPackages.map((pkg) => (
              <label
                key={pkg.id}
                className={`
              flex cursor-pointer flex-wrap items-center justify-between gap-4
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
                    name="baptism-package"
                    checked={booking.service_package_id === pkg.id}
                    onChange={() => selectPackage(pkg)}
                    className="h-5 w-5 accent-[#B22222]"
                  />

                  <span className="text-lg">{pkg.name}</span>
                </div>

                <span className="text-2xl font-semibold text-[#B22222]">
                  {formatPhpCurrency(
                    pkg.base_price +
                      pkg.inclusions.reduce((sum, item) => sum + item.price, 0),
                  )}
                </span>
                <div className="w-full border-t border-gray-200 pt-4">
                  <p className="font-semibold text-gray-800">
                    Package Inclusions{" "}
                    <span
                      lang="tl"
                      className="block text-xs font-normal text-gray-500"
                    >
                      Mga kasama sa pakete
                    </span>
                  </p>
                  {pkg.inclusions.length > 0 ? (
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                      {pkg.inclusions.map((item) => (
                        <li
                          key={item.id}
                          className="flex gap-2 text-sm text-gray-700"
                        >
                          <span
                            aria-hidden="true"
                            className="font-bold text-[#B22222]"
                          >
                            ✓
                          </span>
                          <span>
                            {item.name}
                            <BookingTranslation text={item.name} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">
                      Inclusions have not been listed yet. Please confirm with
                      the parish office.
                      <span lang="tl" className="block">
                        Wala pang nakalistang kasama sa pakete. Magtanong sa
                        opisina ng parokya.
                      </span>
                    </p>
                  )}
                  <p className="mt-3 text-xs text-gray-500">
                    Package total includes the listed items. Additional sponsor
                    fees are separate.
                    <span lang="tl" className="block">
                      Kasama sa kabuuang halaga ang mga nakalistang item.
                      Hiwalay ang bayad sa dagdag na sponsor.
                    </span>
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h4 className="mb-3 text-center font-bold italic text-[#B22222]">
            Note
            <BookingTranslation text="Note" />
          </h4>

          <p className="text-center italic text-[#B22222]">
            The package rate includes the <b>first two sponsors</b>.
            <span lang="tl" className="mt-1 block text-sm">
              Kasama sa pakete ang unang dalawang ninong o ninang.
            </span>
          </p>

          <p className="text-center italic text-[#B22222]">
            Additional sponsors are charged
            <b>
              {additionalSponsorPrice === null
                ? " at the current parish rate."
                : ` ${formatPhpCurrency(additionalSponsorPrice)} per person.`}
            </b>
            <span lang="tl" className="mt-1 block text-sm">
              May hiwalay na bayad bawat dagdag na ninong o ninang:{" "}
              {additionalSponsorPrice === null
                ? "ayon sa kasalukuyang halaga ng parokya."
                : formatPhpCurrency(additionalSponsorPrice)}
              .
            </span>
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
