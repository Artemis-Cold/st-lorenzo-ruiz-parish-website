import {
  Download,
  FileCheck2,
  FileText,
  Eye,
  CalendarDays,
} from "lucide-react";

import { BookingCard } from "../booking";

interface DocumentItem {
  id: number;
  document: string;
  requestedDate: string;
  releasedDate: string;
  status: "Released" | "Processing";
}

const documents: DocumentItem[] = [
  {
    id: 1,
    document: "Baptismal Certificate",
    requestedDate: "March 18, 2026",
    releasedDate: "March 20, 2026",
    status: "Released",
  },
  {
    id: 2,
    document: "Marriage Certificate",
    requestedDate: "April 2, 2026",
    releasedDate: "April 5, 2026",
    status: "Released",
  },
  {
    id: 3,
    document: "Confirmation Certificate",
    requestedDate: "April 12, 2026",
    releasedDate: "-",
    status: "Processing",
  },
];

export default function Documents() {
  return (
    <BookingCard title="My Documents">
      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="rounded-2xl border border-gray-200 p-5 transition hover:border-[#B22222]"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-red-50 p-3">
                  <FileText
                    size={26}
                    className="text-[#B22222]"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    {doc.document}
                  </h3>

                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} />
                      Requested: {doc.requestedDate}
                    </div>

                    <div className="flex items-center gap-2">
                      <FileCheck2 size={15} />
                      Released: {doc.releasedDate}
                    </div>
                  </div>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  doc.status === "Released"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {doc.status}
              </span>
            </div>

            {doc.status === "Released" && (
              <div className="mt-5 flex justify-end gap-3 border-t pt-4">
                <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                  <Eye size={16} />
                  Preview
                </button>

                <button className="flex items-center gap-2 rounded-lg bg-[#B22222] px-4 py-2 text-sm text-white transition hover:bg-[#991B1B]">
                  <Download size={16} />
                  Download
                </button>
              </div>
            )}
          </div>
        ))}

        {documents.length === 0 && (
          <div className="rounded-xl border border-dashed py-12 text-center">
            <FileText
              size={48}
              className="mx-auto mb-4 text-gray-300"
            />

            <h3 className="text-lg font-semibold">
              No Documents Yet
            </h3>

            <p className="mt-2 text-gray-500">
              Your released documents will appear here.
            </p>
          </div>
        )}
      </div>
    </BookingCard>
  );
}