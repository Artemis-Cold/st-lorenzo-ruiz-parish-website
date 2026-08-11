import { BookingCard } from "../..";

import BaptismForm from "../forms/BaptismForm";
import ConfirmationForm from "../forms/ConfirmationForm";
import DeathForm from "../forms/DeathForm";
import MarriageForm from "../forms/MarriageBansForm";
import PermissionForm from "../forms/PermissionForm";

import type {
  DocumentRequestBooking,
  DocumentRequest,
  DocumentDetailValue,
  BaptismalCertificateDetails,
  ConfirmationCertificateDetails,
  DeathCertificateDetails,
  MarriageCertificateDetails,
  PermissionRequestDetails,
} from "../../../../types/document";

import type {
  Dispatch,
  SetStateAction,
} from "react";

interface Props {
  booking: DocumentRequestBooking;
  setBooking: Dispatch<
    SetStateAction<DocumentRequestBooking>
  >;
  readOnly?: boolean;
  errors?: Record<string, string[]>;
}

export default function DetailsStep({
  booking,
  setBooking,
  readOnly = false,
  errors,
}: Props) {
  const updateRequest = (
    requestId: number,
    field: string,
    value: DocumentDetailValue,
  ) => {
    setBooking((prev) => ({
      ...prev,
      requests: prev.requests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              details: {
                ...request.details,
                [field]: value,
              },
            }
          : request,
      ),
    }));
  };

  const removeRequest = (requestId: number) => {
    setBooking((prev) => ({
      ...prev,
      requests: prev.requests.filter(
        (request) => request.id !== requestId,
      ),
    }));
  };

  const renderForm = (request: DocumentRequest, index: number) => {
    const sharedProps = {
      readOnly,
      updateRequest: (field: string, value: DocumentDetailValue) =>
        updateRequest(request.id, field, value),
      errors,
      errorPrefix: "requests." + index + ".details",
    };

    switch (request.document_type) {
      case "Baptismal Certificate":
        return (
          <BaptismForm
            {...sharedProps}
            details={request.details as BaptismalCertificateDetails}
          />
        );

      case "Confirmation Certificate":
        return (
          <ConfirmationForm
            {...sharedProps}
            details={request.details as ConfirmationCertificateDetails}
          />
        );

      case "Death Certificate":
        return (
          <DeathForm
            {...sharedProps}
            details={request.details as DeathCertificateDetails}
          />
        );

      case "Marriage Certificate":
        return (
          <MarriageForm
            {...sharedProps}
            details={request.details as MarriageCertificateDetails}
          />
        );

      case "Request of Permission":
        return (
          <PermissionForm
            {...sharedProps}
            details={request.details as PermissionRequestDetails}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {booking.requests.length === 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">No documents selected</p>
          <p className="mt-1 text-sm text-red-600">
            Go back to Selection and choose at least one document before
            continuing to payment.
          </p>
          {errors?.requests?.[0] && (
            <p className="mt-2 text-sm font-medium text-red-700">
              {errors.requests[0]}
            </p>
          )}
        </div>
      )}
      {booking.requests.map((request, index) => (
        <BookingCard
          key={request.id}
          title={request.document_type}
        >
          <div className="space-y-6">
            {renderForm(request, index)}

            {!readOnly && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    removeRequest(request.id)
                  }
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Remove Request
                </button>
              </div>
            )}
          </div>
        </BookingCard>
      ))}
    </div>
  );
}
