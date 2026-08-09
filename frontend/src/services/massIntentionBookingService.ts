import { AxiosError } from "axios";

import api from "@/api/axios";
import type { MassIntentionBooking } from "../features/parishioner/types/mass";

function appendValue(formData: FormData, key: string, value: unknown): void {
  if (value instanceof File) {
    formData.append(key, value);
  } else if (value instanceof Date) {
    formData.append(key, value.toISOString().split("T")[0]);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) =>
      appendValue(formData, key + "[" + index + "]", item),
    );
  } else if (value !== null && typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) =>
      appendValue(formData, key + "[" + childKey + "]", childValue),
    );
  } else {
    formData.append(key, value === null ? "" : String(value));
  }
}

export async function submitMassIntention(booking: MassIntentionBooking) {
  const formData = new FormData();
  const normalizedBooking: MassIntentionBooking = {
    ...booking,
    groups: booking.groups.map((group) => ({
      ...group,
      entries: group.entries.map((entry) => ({
        ...entry,
        names: entry.names
          .map((name) => name.trim())
          .filter((name) => name !== ""),
      })),
    })),
  };

  Object.entries(normalizedBooking).forEach(([key, value]) =>
    appendValue(formData, key, value),
  );

  try {
    const response = await api.post("/bookings/mass-intention", formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 422) {
        throw { validationErrors: error.response.data.errors };
      }

      throw new Error(
        error.response?.data?.message ?? "Mass Intention submission failed.",
        { cause: error },
      );
    }

    throw error;
  }
}
