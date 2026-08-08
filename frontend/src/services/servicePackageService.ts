import api from "../api/axios";

export interface ServicePackage {
  id: number;
  name: string;
  base_price: number;
  recommended: boolean;
}

export async function getServicePackages(
  serviceCode: string
): Promise<ServicePackage[]> {
  const { data } = await api.get(
    `/services/${serviceCode}/packages`
  );

  return data;
}