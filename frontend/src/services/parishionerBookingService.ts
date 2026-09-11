import api from "@/api/axios";
import type { ProfileBooking } from "@/api/auth";

export interface ParishionerBookingDetail {
  id: number;
  reference: string;
  service: string;
  serviceCode: string;
  status: ProfileBooking["status"];
  bookingSlotId: number | null;
  canReschedule: boolean;
  canUploadDocuments: boolean;
  missingRequirements: MissingRequirement[];
  submittedAt: string;
  remarks: string | null;
  schedule: {
    date: string | null;
    startTime: string | null;
    endTime: string | null;
  };
  package: {
    name: string;
    baseAmount: number;
    inclusions: string[];
    addons: Array<{ name: string; price: number }>;
    fees: Array<{
      name: string;
      price: number;
      quantity: number;
      subtotal: number;
    }>;
    totalAmount: number;
  } | null;
  payment: {
    required: boolean;
    method: "gcash" | "cash" | null;
    referenceNumber: string | null;
    officialReceiptNumber: string | null;
    amount: number;
    status:
      | "not_submitted"
      | "awaiting_payment"
      | "pending_verification"
      | "confirmed"
      | "rejected";
    receipt: { fileName: string; url: string } | null;
    canChangeMethod: boolean;
  };
  sections: Array<{
    title: string;
    fields: Array<{ label: string; value: string }>;
  }>;
  documents: Array<{
    id: number | null;
    type: string;
    requirementType: string;
    fileName: string;
    status: string;
    remarks: string | null;
    url: string;
  }>;
}

export async function submitParishionerBookingPayment(
  bookingId: number,
  paymentMethod: "gcash" | "cash",
  referenceNumber?: string,
  receipt?: File | null,
) {
  const formData = new FormData();
  formData.append("payment_method", paymentMethod);
  if (paymentMethod === "gcash" && referenceNumber) {
    formData.append("reference_number", referenceNumber);
  }
  if (paymentMethod === "gcash" && receipt) {
    formData.append("receipt", receipt);
  }

  const response = await api.post<{
    message: string;
    data: ParishionerBookingDetail["payment"];
  }>(`/bookings/${bookingId}/payment`, formData);

  return {
    ...response.data,
    data: {
      ...response.data.data,
      amount: Number(response.data.data.amount),
    },
  };
}

export interface MissingRequirement {
  key: string;
  label: string;
  types: string[];
}

export async function getParishionerBooking(id: number) {
  const response = await api.get<{ data: ParishionerBookingDetail }>(
    `/bookings/${id}`,
  );
  return normalizeBookingMoney(response.data.data);
}

export async function uploadParishionerBookingDocument(
  bookingId: number,
  documentType: string,
  file: File,
) {
  const formData = new FormData();
  formData.append("document_type", documentType);
  formData.append("file", file);

  const response = await api.post<{
    message: string;
    data: {
      document: ParishionerBookingDetail["documents"][number];
      missingRequirements: MissingRequirement[];
    };
  }>(`/bookings/${bookingId}/documents`, formData);

  return response.data;
}

export interface RescheduledBooking {
  id: number;
  status: ProfileBooking["status"];
  bookingSlotId: number;
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

function normalizeBookingMoney(
  booking: ParishionerBookingDetail,
): ParishionerBookingDetail {
  return {
    ...booking,
    package: booking.package
      ? {
          ...booking.package,
          baseAmount: Number(booking.package.baseAmount),
          addons: booking.package.addons.map((addon) => ({
            ...addon,
            price: Number(addon.price),
          })),
          fees: booking.package.fees.map((fee) => ({
            ...fee,
            price: Number(fee.price),
            subtotal: Number(fee.subtotal),
          })),
          totalAmount: Number(booking.package.totalAmount),
        }
      : null,
    payment: {
      ...booking.payment,
      amount: Number(booking.payment.amount),
    },
  };
}

export async function rescheduleParishionerBooking(
  id: number,
  bookingSlotId: number,
) {
  const response = await api.patch<{
    message: string;
    data: RescheduledBooking;
  }>(`/bookings/${id}/reschedule`, {
    booking_slot_id: bookingSlotId,
  });

  return response.data;
}
