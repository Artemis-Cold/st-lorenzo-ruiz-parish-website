import api from "../api/axios";

export interface PackageInclusion {
  id: number;
  service_package_id: number;
  name: string;
  price: number;
}

export interface PackageAddon {
  id: number;
  service_package_id: number;
  name: string;
  price: number;
}

export interface ServicePackage {
  id: number;
  name: string;
  base_price: number;
  recommended: boolean;
  inclusions: PackageInclusion[];
  addons: PackageAddon[];
}

export async function getServicePackages(
  serviceCode: string
): Promise<ServicePackage[]> {
  const { data } = await api.get(
    `/services/${serviceCode}/packages`
  );

  return data;
}