import { AxiosError } from "axios";

import api from "@/api/axios";
import type {
  FormationSacramentBooking,
  FormationSacramentCode,
} from "@/features/parishioner/types/formationSacrament";

export async function submitFormationSacramentBooking(
  serviceCode: FormationSacramentCode,
  booking: FormationSacramentBooking,
  scheduleRequestId: number,
) {
  const data = new FormData();
  if (serviceCode === "confirmation" && scheduleRequestId)
    data.append("schedule_request_id", String(scheduleRequestId));
  if (serviceCode === "confirmation")
    data.append("booking_slot_id", String(booking.booking_slot_id));
  if (serviceCode === "confirmation")
    data.append("service_package_id", String(booking.service_package_id));
  data.append("remarks", booking.remarks);

  Object.entries(booking.candidate).forEach(([key, value]) => {
    data.append(`candidate[${key}]`, value);
  });
  booking.parents.forEach((parent, index) => {
    Object.entries(parent).forEach(([key, value]) => {
      data.append(`parents[${index}][${key}]`, value);
    });
  });
  booking.sponsors.forEach((sponsor, index) => {
    Object.entries(sponsor).forEach(([key, value]) => {
      if (value instanceof File) {
        data.append(`sponsors[${index}][${key}]`, value);
      } else if (value !== null) {
        data.append(`sponsors[${index}][${key}]`, value);
      }
    });
  });

  if (booking.baptismal_certificate) {
    data.append("documents[0][document_type]", "baptismal_certificate");
    data.append("documents[0][file]", booking.baptismal_certificate);
  }

  try {
    const response = await api.post(
      `/bookings/formation-sacrament/${serviceCode}`,
      data,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 422) {
      throw {
        validationErrors: error.response.data.errors as Record<
          string,
          string[]
        >,
      };
    }
    throw error;
  }
}
