import { AxiosError } from "axios";

import api from "@/api/axios";
import type { WeddingBooking } from "../features/parishioner/types/wedding";

function buildFormData(booking: WeddingBooking): FormData {
  const formData = new FormData();

  formData.append("booking_slot_id", String(booking.booking_slot_id));
  formData.append("service_package_id", String(booking.service_package_id));
  formData.append("remarks", booking.remarks ?? "");

  booking.selected_addon_ids.forEach((addonId, index) => {
    formData.append("selected_addon_ids[" + index + "]", String(addonId));
  });

  (["groom", "bride"] as const).forEach((role) => {
    const person = booking.applicant[role];
    const prefix = "applicant[" + role + "]";

    formData.append(prefix + "[first_name]", person.first_name);
    formData.append(prefix + "[middle_initial]", person.middle_initial);
    formData.append(prefix + "[last_name]", person.last_name);
    formData.append(prefix + "[address]", person.address);
    formData.append(prefix + "[age]", person.age === null ? "" : String(person.age));
    formData.append(prefix + "[contact_number]", person.contact_number);
    formData.append(prefix + "[church][baptized_in]", person.church.baptized_in);
    formData.append(prefix + "[church][confirmed_in]", person.church.confirmed_in);

    (["father", "mother"] as const).forEach((parent) => {
      formData.append(
        prefix + "[" + parent + "][first_name]",
        person[parent].first_name,
      );
      formData.append(
        prefix + "[" + parent + "][middle_initial]",
        person[parent].middle_initial,
      );
      formData.append(
        prefix + "[" + parent + "][last_name]",
        person[parent].last_name,
      );
    });

    formData.append(
      prefix + "[previous_church_marriage][church_name]",
      person.previous_church_marriage.church_name,
    );
    formData.append(
      prefix + "[previous_church_marriage][priest]",
      person.previous_church_marriage.priest,
    );
    formData.append(
      prefix + "[previous_church_marriage][church_address]",
      person.previous_church_marriage.church_address,
    );
  });

  booking.documents.forEach((document, index) => {
    formData.append(
      "documents[" + index + "][document_type]",
      document.document_type,
    );
    formData.append("documents[" + index + "][file]", document.file);
  });

  return formData;
}

export async function submitWeddingBooking(booking: WeddingBooking) {
  try {
    const response = await api.post(
      "/bookings/wedding",
      buildFormData(booking),
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 422) {
        throw { validationErrors: error.response.data.errors };
      }

      throw new Error(
        error.response?.data?.message ?? "Wedding booking submission failed.",
        { cause: error },
      );
    }

    throw error;
  }
}
