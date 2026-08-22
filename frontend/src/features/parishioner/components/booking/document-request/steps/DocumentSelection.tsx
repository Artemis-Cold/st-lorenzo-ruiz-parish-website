import type { Dispatch, SetStateAction } from "react";
import { Circle, CircleCheck } from "lucide-react";

import { BookingCard } from "../..";

import {
  DOCUMENT_PRICES,
  getDocumentPrice,
} from "../../../../data/documentPrices";

import type {
  DocumentDetails,
  DocumentRequest,
  DocumentRequestBooking,
  DocumentType,
} from "../../../../types/document";

interface Props {
  booking: DocumentRequestBooking;
  setBooking: Dispatch<SetStateAction<DocumentRequestBooking>>;
  errors?: Record<string, string[]>;
}

function createDefaultDetails(type: DocumentType): DocumentDetails {
  switch (type) {
    case "Baptismal Certificate":
      return {
        name: "",
        address: "",
        baptism_date: null,
      };

    case "Confirmation Certificate":
      return {
        name: "",
        address: "",
        confirmation_date: null,
      };

    case "Death Certificate":
      return {
        name: "",
        address: "",
      };

    case "Marriage Certificate":
      return {
        bride_name: "",
        groom_name: "",
        address: "",
        marriage_date: null,
      };

    case "Request of Permission":
      return {
        full_name: "",
        address: "",
      };
  }
}

export default function DocumentSelectionStep({
  booking,
  setBooking,
  errors,
}: Props) {
  const toggleDocument = (type: DocumentType) => {
    setBooking((prev) => {
      const exists = prev.requests.some(
        (request) => request.document_type === type,
      );

      if (exists) {
        return {
          ...prev,
          requests: prev.requests.filter(
            (request) => request.document_type !== type,
          ),
        };
      }

      const newRequest: DocumentRequest = {
        id: Date.now(),
        document_type: type,
        price: getDocumentPrice(type),
        details: createDefaultDetails(type),
      };

      return {
        ...prev,
        requests: [...prev.requests, newRequest],
      };
    });
  };

  return (
    <BookingCard title="Select Documents" contentClassName="p-4 sm:p-6 md:p-8">
      <div className="space-y-4 sm:space-y-6">
        <div className="divide-y overflow-hidden rounded-xl border">
          {DOCUMENT_PRICES.map((document) => {
            const selected = booking.requests.some(
              (request) => request.document_type === document.type,
            );

            return (
              <button
                key={document.type}
                type="button"
                onClick={() => toggleDocument(document.type)}
                aria-pressed={selected}
                className={`
                  grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3
                  px-3 py-3 text-left transition sm:gap-4 sm:px-5 sm:py-4

                  ${selected ? "bg-red-50" : "hover:bg-gray-50"}
                `}
              >
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  {selected ? (
                    <CircleCheck size={22} className="shrink-0 text-[#B22222]" />
                  ) : (
                    <Circle size={22} className="shrink-0 text-gray-400" />
                  )}

                  <span className="min-w-0 wrap-break-word text-sm leading-5 tracking-wide md:text-lg md:leading-normal">
                    {document.type.toUpperCase()}
                  </span>
                </div>

                <span className="shrink-0 whitespace-nowrap font-semibold text-[#B22222] md:text-xl">
                  ₱{document.price.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
        {errors?.requests?.[0] && (
          <p className="text-sm text-red-600">{errors.requests[0]}</p>
        )}

        {booking.requests.length > 0 && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-[#B22222] sm:p-4">
            <strong>{booking.requests.length}</strong> document
            {booking.requests.length > 1 ? "s" : ""} selected.
          </div>
        )}
      </div>
    </BookingCard>
  );
}
