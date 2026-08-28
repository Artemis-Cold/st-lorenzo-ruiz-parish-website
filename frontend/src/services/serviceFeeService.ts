import api from "@/api/axios";

export interface ServiceFee {
  id: number;
  code: string;
  name: string;
  amount: number;
}

export async function getServiceFees(serviceCode: string): Promise<ServiceFee[]> {
  const response = await api.get<{ data: ServiceFee[] }>(
    `/services/${serviceCode}/fees`,
  );

  return response.data.data;
}
