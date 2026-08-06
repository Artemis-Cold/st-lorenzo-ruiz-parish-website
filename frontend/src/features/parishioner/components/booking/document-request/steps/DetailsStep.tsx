import { BookingCard } from "../..";

import BaptismForm from "../forms/BaptismForm";
import ConfirmationForm from "../forms/ConfirmationForm";
import DeathForm from "../forms/DeathForm";
import MarriageForm from "../forms/MarriageBansForm";
import MarriageBansForm from "../forms/MarriageBansForm";
import PermissionForm from "../forms/PermissionForm";

import type {
  DocumentRequestBooking,
  DocumentRequest,
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
}

export default function DetailsStep({
  booking,
  setBooking,
  readOnly = false,
}: Props) {
  const updateRequest = (
    requestId: number,
    field: string,
    value: any,
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

  const renderForm = (request: DocumentRequest) => {
    const props = {
      details: request.details as any,
      readOnly,
      updateRequest: (field: string, value: any) =>
        updateRequest(request.id, field, value),
    };

    switch (request.documentType) {
      case "Baptismal Certificate":
        return <BaptismForm {...props} />;

      case "Confirmation Certificate":
        return <ConfirmationForm {...props} />;

      case "Death Certificate":
        return <DeathForm {...props} />;

      case "Marriage Certificate":
        return <MarriageForm {...props} />;

      case "Publication of Marriage Bans":
        return <MarriageBansForm {...props} />;

      case "Request of Permission":
        return <PermissionForm {...props} />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {booking.requests.map((request) => (
        <BookingCard
          key={request.id}
          title={request.documentType}
        >
          <div className="space-y-6">
            {renderForm(request)}

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