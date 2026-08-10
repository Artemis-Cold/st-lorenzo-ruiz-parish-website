import { CalendarDays, FileText } from "lucide-react";

import type { ProfileDocument } from "@/api/auth";
import { BookingCard } from "../booking";

const documentLabel = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const statusStyle: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  approved: "bg-blue-100 text-blue-700",
  ready_for_pickup: "bg-purple-100 text-purple-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-gray-200 text-gray-700",
};

export default function Documents({ documents, onView }: { documents: ProfileDocument[]; onView: (id: number) => void }) {
  return (
    <BookingCard title="My Document Requests">
      <div className="space-y-4">
        {documents.map((document) => (
          <div key={document.id} onClick={() => onView(document.booking_id)} className="cursor-pointer rounded-2xl border border-gray-200 p-5 transition hover:border-[#B22222]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="rounded-xl bg-red-50 p-3">
                  <FileText size={26} className="text-[#B22222]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {documentLabel(document.document_type)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {document.booking_reference}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays size={15} />
                    Requested {new Date(document.requested_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    ₱{Number(document.price).toFixed(2)}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyle[document.status] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                {documentLabel(document.status)}
              </span>
            </div>
            <p className="mt-3 text-right text-xs font-semibold text-[#B22222]">View request information</p>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="rounded-xl border border-dashed py-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold">No Document Requests Yet</h3>
            <p className="mt-2 text-gray-500">
              Documents you request will appear here.
            </p>
          </div>
        )}
      </div>
    </BookingCard>
  );
}
