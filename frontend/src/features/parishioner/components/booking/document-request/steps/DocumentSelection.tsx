import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { FileText, Minus, Plus } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { BookingCard } from "../..";

import { getServiceFees, type ServiceFee } from "@/services/serviceFeeService";

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
  const [documents, setDocuments] = useState<ServiceFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    getServiceFees("document-request")
      .then((fees) => {
        if (!active) return;
        setDocuments(fees);
        setBooking((current) => ({
          ...current,
          requests: current.requests.map((request) => {
            const fee = fees.find(
              (item) => item.name === request.document_type,
            );
            return fee ? { ...request, price: fee.amount } : request;
          }),
        }));
        setLoadError(false);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [setBooking]);

  const addDocument = (document: ServiceFee) => {
    const type = document.name as DocumentType;
    setBooking((prev) => {
      const count = prev.requests.filter(
        (request) => request.document_type === type,
      ).length;
      if (count >= 10) return prev;

      const newRequest: DocumentRequest = {
        id: Math.max(0, ...prev.requests.map((request) => request.id)) + 1,
        document_type: type,
        price: document.amount,
        details: createDefaultDetails(type),
      };

      return {
        ...prev,
        requests: [...prev.requests, newRequest],
      };
    });
  };

  const removeDocument = (type: DocumentType) => {
    setBooking((prev) => {
      const lastIndex = prev.requests
        .map((request) => request.document_type)
        .lastIndexOf(type);
      if (lastIndex === -1) return prev;

      return {
        ...prev,
        requests: prev.requests.filter((_, index) => index !== lastIndex),
      };
    });
  };
  const totalAmount = booking.requests.reduce(
    (sum, request) => sum + request.price,
    0,
  );

  return (
    <BookingCard title="Select Documents" contentClassName="p-4 sm:p-6 md:p-8">
      <div className="space-y-4 sm:space-y-6">
        {loading && (
          <div
            aria-label="Loading document prices"
            aria-busy="true"
            className="space-y-3"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        )}
        {loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            Current document prices could not be loaded. Please refresh the
            page.
          </div>
        )}
        {!loading && !loadError && (
          <div className="space-y-3">
            {documents.map((document) => {
              const type = document.name as DocumentType;
              const quantity = booking.requests.filter(
                (request) => request.document_type === type,
              ).length;

              return (
                <div
                  key={document.id}
                  className={`
                  flex w-full min-w-0 flex-col gap-3 rounded-2xl border p-4
                  text-left transition sm:grid sm:grid-cols-[minmax(0,1fr)_auto]
                  sm:items-center sm:gap-5 sm:px-5 sm:py-4

                  ${quantity > 0 ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"}
                `}
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${quantity > 0 ? "bg-[#B22222] text-white" : "bg-gray-100 text-gray-400"}`}
                    >
                      <FileText size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="wrap-break-word text-sm font-medium leading-5 tracking-wide md:text-base md:leading-normal">
                        {document.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        ₱{document.amount.toFixed(2)} per request
                        {quantity > 0 &&
                          ` · ₱${(document.amount * quantity).toFixed(2)} subtotal`}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center justify-between gap-3 border-t border-gray-200/80 pt-3 sm:border-0 sm:pt-0">
                    <div className="min-w-0 sm:hidden">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Quantity
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-[#292524]">
                        {quantity > 0 ? `${quantity} selected` : "Not selected"}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => removeDocument(type)}
                        disabled={quantity === 0}
                        aria-label={`Remove one ${document.name}`}
                        className="grid size-11 place-items-center text-gray-600 transition hover:bg-red-50 hover:text-[#B22222] disabled:cursor-not-allowed disabled:opacity-30 sm:size-10"
                      >
                        <Minus size={17} />
                      </button>
                      <span className="grid h-11 min-w-11 place-items-center border-x border-gray-200 px-2 font-bold tabular-nums text-[#292524] sm:h-10 sm:min-w-10">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => addDocument(document)}
                        disabled={quantity >= 10}
                        aria-label={`Add one ${document.name}`}
                        className="grid size-11 place-items-center text-[#B22222] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 sm:size-10"
                      >
                        <Plus size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {errors?.requests?.[0] && (
          <p className="text-sm text-red-600">{errors.requests[0]}</p>
        )}

        {booking.requests.length > 0 && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div>
              <p className="text-sm font-semibold text-[#B22222]">
                {booking.requests.length} document request
                {booking.requests.length > 1 ? "s" : ""} selected
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-600">
                You can request up to 10 of each document type.
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-red-100 pt-3 sm:mt-0 sm:block sm:border-0 sm:pt-0 sm:text-right">
              <span className="text-xs font-medium text-gray-500 sm:block">
                Estimated total
              </span>
              <span className="font-bold tabular-nums text-[#B22222] sm:mt-1 sm:block sm:text-lg">
                ₱{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </BookingCard>
  );
}
