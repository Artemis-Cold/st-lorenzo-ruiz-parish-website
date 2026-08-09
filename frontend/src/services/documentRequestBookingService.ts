import { AxiosError } from "axios";

import api from "@/api/axios";
import type { DocumentRequestBooking } from "../features/parishioner/types/document";

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

export async function submitDocumentRequest(booking: DocumentRequestBooking) {
  const formData = new FormData();
  Object.entries(booking).forEach(([key, value]) =>
    appendValue(formData, key, value),
  );

  try {
    const response = await api.post("/bookings/document-request", formData, {
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
        error.response?.data?.message ?? "Document request submission failed.",
        { cause: error },
      );
    }

    throw error;
  }
}
