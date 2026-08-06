import type { Dispatch, SetStateAction } from "react";
import { Check, FileText } from "lucide-react";

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
}

function createDefaultDetails(type: DocumentType): DocumentDetails {
  switch (type) {
    case "Baptismal Certificate":
      return {
        name: "",
        address: "",
        baptismDate: null,
      };

    case "Confirmation Certificate":
      return {
        name: "",
        address: "",
        confirmationDate: null,
      };

    case "Death Certificate":
      return {
        name: "",
        address: "",
      };

    case "Marriage Certificate":
      return {
        brideName: "",
        groomName: "",
        address: "",
        marriageDate: null,
      };

    case "Publication of Marriage Bans":
      return {
        brideName: "",
        groomName: "",
        address: "",
        marriageDate: null,
      };

    case "Request of Permission":
      return {
        fullName: "",
        address: "",
      };
  }
}

export default function DocumentSelectionStep({ booking, setBooking }: Props) {
  const toggleDocument = (type: DocumentType) => {
    setBooking((prev) => {
      const exists = prev.requests.some(
        (request) => request.documentType === type,
      );

      if (exists) {
        return {
          ...prev,
          requests: prev.requests.filter(
            (request) => request.documentType !== type,
          ),
        };
      }

      const newRequest: DocumentRequest = {
        id: Date.now(),
        documentType: type,
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
    <BookingCard title="Select Documents">
      <div className="space-y-6">
        <div className="divide-y rounded-xl border">
          {DOCUMENT_PRICES.map((document) => {
            const selected = booking.requests.some(
              (request) => request.documentType === document.type,
            );

            return (
              <button
                key={document.type}
                type="button"
                onClick={() => toggleDocument(document.type)}
                className={`
                  flex w-full items-center justify-between
                  px-5 py-4 transition

                  ${selected ? "bg-red-50" : "hover:bg-gray-50"}
                `}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                    flex h-10 w-10 items-center justify-center
                    rounded-lg border

                    ${
                      selected
                        ? "border-[#B22222] bg-[#B22222]"
                        : "border-red-200 bg-white"
                    }
                  `}
                  >
                    {selected ? (
                      <Check size={18} className="text-white" />
                    ) : (
                      <FileText size={18} className="text-[#B22222]" />
                    )}
                  </div>

                  <span className="text-lg tracking-wide">
                    {document.type.toUpperCase()}
                  </span>
                </div>

                <span className="text-xl font-semibold text-[#B22222]">
                  ₱{document.price.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>

        {booking.requests.length > 0 && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-[#B22222]">
            <strong>{booking.requests.length}</strong> document
            {booking.requests.length > 1 ? "s" : ""} selected.
          </div>
        )}
      </div>
    </BookingCard>
  );
}
