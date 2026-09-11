import api from "@/api/axios";

export interface StaffPriceItem {
  id: number;
  name: string;
  price: number;
}

export interface StaffPricingPackage {
  id: number;
  serviceCode: "baptism" | "wedding" | "funeral";
  serviceName: string;
  name: string;
  basePrice: number;
  basePriceEditable: boolean;
  inclusions: StaffPriceItem[];
  addons: StaffPriceItem[];
}

export interface StaffServiceFee {
  id: number;
  serviceCode: string;
  serviceName: string;
  code: string;
  name: string;
  amount: number;
}

export interface StaffPricingData {
  packages: StaffPricingPackage[];
  fees: StaffServiceFee[];
}

export interface UpdatePricingInput {
  packages: Array<{ id: number; basePrice: number }>;
  inclusions: Array<{ id: number; price: number }>;
  addons: Array<{ id: number; price: number }>;
  fees: Array<{ id: number; amount: number }>;
}

function normalizePricing(data: StaffPricingData): StaffPricingData {
  return {
    packages: data.packages.map((servicePackage) => ({
      ...servicePackage,
      basePrice: Number(servicePackage.basePrice),
      inclusions: servicePackage.inclusions.map((inclusion) => ({
        ...inclusion,
        price: Number(inclusion.price),
      })),
      addons: servicePackage.addons.map((addon) => ({
        ...addon,
        price: Number(addon.price),
      })),
    })),
    fees: data.fees.map((fee) => ({
      ...fee,
      amount: Number(fee.amount),
    })),
  };
}

export async function getStaffPricing(): Promise<StaffPricingData> {
  const response = await api.get<{ data: StaffPricingData }>(
    "/staff/settings/pricing",
  );
  return normalizePricing(response.data.data);
}

export async function updateStaffPricing(input: UpdatePricingInput) {
  const response = await api.put<{
    message: string;
    data: StaffPricingData;
  }>("/staff/settings/pricing", input);

  return {
    ...response.data,
    data: normalizePricing(response.data.data),
  };
}
