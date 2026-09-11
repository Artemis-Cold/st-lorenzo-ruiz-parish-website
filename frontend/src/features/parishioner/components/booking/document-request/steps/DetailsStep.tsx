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
  DocumentRequesterProfile,
  DocumentType,
  BaptismalCertificateDetails,
  ConfirmationCertificateDetails,
  DeathCertificateDetails,
  MarriageCertificateDetails,
  PermissionRequestDetails,
} from "../../../../types/document";

import type { Dispatch, SetStateAction } from "react";

interface Props {
  booking: DocumentRequestBooking;
  setBooking: Dispatch<SetStateAction<DocumentRequestBooking>>;
  requester: DocumentRequesterProfile;
  readOnly?: boolean;
  errors?: Record<string, string[]>;
}

export default function DetailsStep({
  booking,
  setBooking,
  requester,
  readOnly = false,
  errors,
}: Props) {
  const updateRequest = (
    documentType: DocumentType,
    field: string,
    value: DocumentDetailValue,
  ) => {
    setBooking((prev) => ({
      ...prev,
      requests: prev.requests.map((request) =>
        request.document_type === documentType
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

  const removeRequest = (documentType: DocumentType) => {
    setBooking((prev) => ({
      ...prev,
      requests: prev.requests.filter(
        (request) => request.document_type !== documentType,
      ),
    }));
  };

  const renderForm = (request: DocumentRequest, index: number) => {
    const sharedProps = {
      readOnly,
      updateRequest: (field: string, value: DocumentDetailValue) =>
        updateRequest(request.document_type, field, value),
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
            requester={requester}
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

  const groupedRequests = Array.from(
    new Map(
      booking.requests.map((request) => [request.document_type, request]),
    ).values(),
  );

  return (
    <div className="space-y-6">
      <BookingCard title="Requester Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadOnlyDetail label="Account holder" value={requester.fullName} />
          <ReadOnlyDetail label="Contact number" value={requester.phone} />
          <div className="sm:col-span-2">
            <ReadOnlyDetail label="Address" value={requester.address} />
          </div>
        </div>
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-800">
          This account holder is the official requester and claimant. These
          details come from the parishioner profile and cannot be changed in
          this request.
        </p>
      </BookingCard>

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
      {groupedRequests.map((request) => {
        const index = booking.requests.findIndex(
          (item) => item.id === request.id,
        );
        const quantity = booking.requests.filter(
          (item) => item.document_type === request.document_type,
        ).length;

        return (
          <BookingCard
            key={request.id}
            title={`${request.document_type} · ${quantity} ${quantity === 1 ? "copy" : "copies"}`}
          >
            <div className="space-y-6">
              {renderForm(request, index)}

              {!readOnly && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRequest(request.document_type)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Remove Document
                  </button>
                </div>
              )}
            </div>
          </BookingCard>
        );
      })}
    </div>
  );
}

function ReadOnlyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[#292524]">{value || "—"}</p>
    </div>
  );
}
