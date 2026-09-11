import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  Banknote,
  BookOpenText,
  Church,
  FileText,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/alert-dialog";
import {
  getStaffPricing,
  updateStaffPricing,
  type StaffPricingData,
  type StaffPricingPackage,
  type StaffServiceFee,
} from "@/services/staffPricingService";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";

type FieldErrors = Record<string, string[]>;
type Section = "sacraments" | "documents" | "mass";

const serviceOrder = ["baptism", "wedding", "funeral"];
const keyFor = (type: "package" | "inclusion" | "addon" | "fee", id: number) =>
  `${type}-${id}`;

function PriceInput({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-gray-200 bg-white p-4">
      <span className="block min-h-10 text-sm font-medium leading-5 text-gray-700">
        {label}
      </span>
      <div
        className={`mt-2 flex overflow-hidden rounded-xl border ${error ? "border-red-400" : "border-gray-300 focus-within:border-[#B22222]"}`}
      >
        <span className="grid w-11 shrink-0 place-items-center border-r border-gray-200 bg-gray-50 font-semibold text-gray-500">
          ₱
        </span>
        <input
          type="number"
          min="0"
          max="999999.99"
          step="0.01"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => {
            const parsed = Number(value);
            if (value.trim() && Number.isFinite(parsed)) {
              onChange(parsed.toFixed(2));
            }
          }}
          className="min-w-0 flex-1 px-3 py-2.5 text-right font-semibold tabular-nums outline-none"
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </label>
  );
}

export default function PricingSettings() {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<StaffPricingData | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [section, setSection] = useState<Section>("sacraments");

  const applyData = (data: StaffPricingData) => {
    const values: Record<string, string> = {};
    data.packages.forEach((item) => {
      values[keyFor("package", item.id)] = item.basePrice.toFixed(2);
      item.inclusions.forEach((inclusion) => {
        values[keyFor("inclusion", inclusion.id)] = inclusion.price.toFixed(2);
      });
      item.addons.forEach((addon) => {
        values[keyFor("addon", addon.id)] = addon.price.toFixed(2);
      });
    });
    data.fees.forEach((fee) => {
      values[keyFor("fee", fee.id)] = fee.amount.toFixed(2);
    });
    setPricing(data);
    setDraft(values);
    setDirty(false);
  };

  useEffect(() => {
    getStaffPricing()
      .then(applyData)
      .catch(() => toast.error("Unable to load service pricing."))
      .finally(() => setLoading(false));
  }, []);

  const packagesByService = useMemo(() => {
    const groups = new Map<string, StaffPricingPackage[]>();
    pricing?.packages.forEach((item) => {
      groups.set(item.serviceCode, [
        ...(groups.get(item.serviceCode) ?? []),
        item,
      ]);
    });
    return groups;
  }, [pricing]);

  const updateDraft = (key: string, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors({});
    setDirty(true);
  };

  const amount = (key: string) => Number.parseFloat(draft[key] ?? "");

  const save = async () => {
    if (!pricing) return;
    setSaving(true);
    setErrors({});

    const inclusions = pricing.packages.flatMap((item) => item.inclusions);
    const addons = pricing.packages.flatMap((item) => item.addons);

    try {
      const response = await updateStaffPricing({
        packages: pricing.packages
          .filter((item) => item.basePriceEditable)
          .map((item) => ({
            id: item.id,
            basePrice: amount(keyFor("package", item.id)),
          })),
        inclusions: inclusions.map((item) => ({
          id: item.id,
          price: amount(keyFor("inclusion", item.id)),
        })),
        addons: addons.map((item) => ({
          id: item.id,
          price: amount(keyFor("addon", item.id)),
        })),
        fees: pricing.fees.map((item) => ({
          id: item.id,
          amount: amount(keyFor("fee", item.id)),
        })),
      });

      applyData(response.data);
      toast.success(response.message);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors ?? {});
        toast.error("Please review the highlighted prices.");
      } else {
        toast.error("Unable to update service pricing.");
      }
    } finally {
      setSaving(false);
    }
  };

  const renderFee = (fee: StaffServiceFee, index: number) => {
    const originalIndex =
      pricing?.fees.findIndex((item) => item.id === fee.id) ?? index;
    return (
      <PriceInput
        key={fee.id}
        label={fee.name}
        value={draft[keyFor("fee", fee.id)] ?? ""}
        error={errors[`fees.${originalIndex}.amount`]?.[0]}
        onChange={(value) => updateDraft(keyFor("fee", fee.id), value)}
      />
    );
  };

  const sections = [
    { id: "sacraments" as const, label: "Sacraments", icon: Church },
    { id: "documents" as const, label: "Documents", icon: FileText },
    { id: "mass" as const, label: "Mass Intention", icon: BookOpenText },
  ];

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <header className="overflow-hidden rounded-3xl bg-linear-to-br from-[#B22222] to-[#741515] px-7 py-8 text-white shadow-lg sm:px-10">
          <button
            type="button"
            onClick={() => navigate("/staff/settings")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition hover:text-white"
          >
            <ArrowLeft size={17} /> Back to Settings
          </button>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 p-3">
              <Banknote size={27} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F5D76E]">
                Parish configuration
              </p>
              <h1 className="mt-1 font-serif text-3xl font-bold">
                Service Pricing
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/75">
                Manage rates shown to parishioners for new booking submissions.
              </p>
            </div>
          </div>
        </header>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          Price changes apply only to new bookings. Existing submitted bookings
          retain their original price and payment breakdown.
        </div>

        <section className="overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-sm">
          <div className="flex gap-2 overflow-x-auto border-b border-gray-100 p-4 sm:px-6">
            {sections.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${section === item.id ? "bg-[#B22222] text-white" : "bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-[#B22222]"}`}
                >
                  <Icon size={17} /> {item.label}
                </button>
              );
            })}
          </div>

          <div className="p-5 sm:p-7">
            {loading && (
              <div
                aria-label="Loading pricing information"
                aria-busy="true"
                className="space-y-6"
              >
                <Skeleton className="h-7 w-52" />
                <div className="grid gap-4 lg:grid-cols-2">
                  <Skeleton className="h-44 rounded-2xl" />
                  <Skeleton className="h-44 rounded-2xl" />
                  <Skeleton className="h-44 rounded-2xl" />
                  <Skeleton className="h-44 rounded-2xl" />
                </div>
              </div>
            )}
            {!loading && !pricing && (
              <div className="rounded-2xl border border-dashed py-14 text-center text-gray-500">
                Pricing information is unavailable.
              </div>
            )}

            {pricing && section === "sacraments" && (
              <div className="space-y-8">
                {serviceOrder.map((serviceCode) => {
                  const servicePackages =
                    packagesByService.get(serviceCode) ?? [];
                  const serviceFees = pricing.fees.filter(
                    (fee) => fee.serviceCode === serviceCode,
                  );
                  if (servicePackages.length === 0 && serviceFees.length === 0)
                    return null;

                  return (
                    <section key={serviceCode} className="space-y-4">
                      <div>
                        <h2 className="font-serif text-xl font-bold capitalize text-[#292524]">
                          {serviceCode}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Package rates and available additions.
                        </p>
                      </div>
                      {servicePackages.map((item) => {
                        const packageIndex = pricing.packages
                          .filter((entry) => entry.basePriceEditable)
                          .findIndex((entry) => entry.id === item.id);
                        return (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-gray-200 bg-[#FAF8F5] p-4 sm:p-5"
                          >
                            <h3 className="font-semibold text-[#292524]">
                              {item.serviceCode === "wedding"
                                ? "Wedding inclusions and add-ons"
                                : item.name}
                            </h3>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              {item.basePriceEditable && (
                                <PriceInput
                                  label="Base package price"
                                  value={
                                    draft[keyFor("package", item.id)] ?? ""
                                  }
                                  error={
                                    errors[
                                      `packages.${packageIndex}.basePrice`
                                    ]?.[0]
                                  }
                                  onChange={(value) =>
                                    updateDraft(
                                      keyFor("package", item.id),
                                      value,
                                    )
                                  }
                                />
                              )}
                              {item.inclusions.map((inclusion) => {
                                const all = pricing.packages.flatMap(
                                  (entry) => entry.inclusions,
                                );
                                const index = all.findIndex(
                                  (entry) => entry.id === inclusion.id,
                                );
                                return (
                                  <PriceInput
                                    key={inclusion.id}
                                    label={`${inclusion.name} (included)`}
                                    value={
                                      draft[
                                        keyFor("inclusion", inclusion.id)
                                      ] ?? ""
                                    }
                                    error={
                                      errors[`inclusions.${index}.price`]?.[0]
                                    }
                                    onChange={(value) =>
                                      updateDraft(
                                        keyFor("inclusion", inclusion.id),
                                        value,
                                      )
                                    }
                                  />
                                );
                              })}
                              {item.addons.map((addon) => {
                                const all = pricing.packages.flatMap(
                                  (entry) => entry.addons,
                                );
                                const index = all.findIndex(
                                  (entry) => entry.id === addon.id,
                                );
                                return (
                                  <PriceInput
                                    key={addon.id}
                                    label={`${addon.name} (add-on)`}
                                    value={
                                      draft[keyFor("addon", addon.id)] ?? ""
                                    }
                                    error={errors[`addons.${index}.price`]?.[0]}
                                    onChange={(value) =>
                                      updateDraft(
                                        keyFor("addon", addon.id),
                                        value,
                                      )
                                    }
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      {serviceFees.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {serviceFees.map((fee, index) =>
                            renderFee(fee, index),
                          )}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}

            {pricing && section === "documents" && (
              <div>
                <h2 className="font-serif text-xl font-bold text-[#292524]">
                  Parish Document Prices
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Rates charged for each requested document.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {pricing.fees
                    .filter((fee) => fee.serviceCode === "document-request")
                    .map((fee, index) => renderFee(fee, index))}
                </div>
              </div>
            )}

            {pricing && section === "mass" && (
              <div>
                <h2 className="font-serif text-xl font-bold text-[#292524]">
                  Mass Intention Rate
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Amount charged for every submitted intention line.
                </p>
                <div className="mt-5 grid gap-3 sm:max-w-md">
                  {pricing.fees
                    .filter((fee) => fee.serviceCode === "mass-intention")
                    .map((fee, index) => renderFee(fee, index))}
                </div>
              </div>
            )}
          </div>

          {pricing && (
            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="text-xs text-gray-500">
                All amounts are saved in Philippine pesos.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    disabled={!dirty || saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Update parish service prices?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      These prices will be shown and applied to new booking
                      submissions. Existing bookings will not be changed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => void save()}
                      className="bg-[#B22222] hover:bg-[#991B1B]"
                    >
                      Confirm Changes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </section>
      </div>
    </StaffDashboardLayout>
  );
}
