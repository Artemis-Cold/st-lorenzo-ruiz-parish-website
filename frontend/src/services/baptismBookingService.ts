import type { BaptismBooking } from "../features/parishioner/types/baptism";
import api from "@/api/axios";
import { AxiosError } from "axios";

function buildFormData(booking: BaptismBooking): FormData {
  const formData = new FormData();

  formData.append("booking_slot_id", String(booking.booking_slot_id));
  formData.append("service_package_id", String(booking.service_package_id));

  formData.append("remarks", booking.remarks ?? "");

  // Baptizand
  const b = booking.baptizand;
  formData.append("baptizand[first_name]", b.first_name);
  formData.append("baptizand[middle_initial]", b.middle_initial ?? "");
  formData.append("baptizand[last_name]", b.last_name);
  formData.append(
    "baptizand[birth_date]",
    b.birth_date ? b.birth_date.toISOString().split("T")[0] : "",
  );
  formData.append("baptizand[birth_place]", b.birth_place ?? "");
  formData.append("baptizand[gender]", b.gender);
  formData.append("baptizand[address]", b.address);
  formData.append("baptizand[contact_number]", b.contact_number ?? "");

  // Parents
  booking.parents.forEach((parent, i) => {
    formData.append(`parents[${i}][relationship]`, parent.relationship);
    formData.append(`parents[${i}][first_name]`, parent.first_name);
    formData.append(
      `parents[${i}][middle_initial]`,
      parent.middle_initial ?? "",
    );
    formData.append(`parents[${i}][last_name]`, parent.last_name);
    formData.append(`parents[${i}][birth_place]`, parent.birth_place);
  });

  formData.append(
    "seminar_date",
    booking.seminar_date
      ? booking.seminar_date.toISOString().split("T")[0]
      : "",
  );

  // Godparent pairs
  booking.god_parents.forEach((pair, i) => {
    (["god_father", "god_mother"] as const).forEach((key) => {
      const gp = pair[key];
      formData.append(`god_parents[${i}][${key}][first_name]`, gp.first_name);
      formData.append(
        `god_parents[${i}][${key}][middle_initial]`,
        gp.middle_initial ?? "",
      );
      formData.append(`god_parents[${i}][${key}][last_name]`, gp.last_name);
      formData.append(`god_parents[${i}][${key}][residence]`, gp.residence);
    });

    if (pair.requirements.marriage_contract) {
      formData.append(
        `god_parents[${i}][requirements][marriage_contract]`,
        pair.requirements.marriage_contract,
      );
    }

    if (pair.requirements.confirmation_certificate) {
      formData.append(
        `god_parents[${i}][requirements][confirmation_certificate]`,
        pair.requirements.confirmation_certificate,
      );
    }
  });

  // Documents
  booking.documents.forEach((doc, i) => {
    formData.append(`documents[${i}][document_type]`, doc.document_type);
    formData.append(`documents[${i}][file]`, doc.file);
  });

  return formData;
}

export async function submitBooking(booking: BaptismBooking) {
  const formData = buildFormData(booking);

  try {
    const res = await api.post("/bookings/baptism", formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      if (err.response?.status === 422) {
        throw { validationErrors: err.response.data.errors };
      }

      throw new Error(
        err.response?.data?.message ?? "Booking submission failed.",
      );
    }

    throw err;
  }
}
