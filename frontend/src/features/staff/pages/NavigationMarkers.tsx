import { useState } from "react";
import { Download, ScanLine } from "lucide-react";
import SettingsPageHeader from "../components/SettingsPageHeader";
import { unityParishMarkers } from "@/features/ar-navigation/unityApp";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import "./navigationQR.css";

export default function NavigationMarkers() {
  const [loaded, setLoaded] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <SettingsPageHeader
          icon={ScanLine}
          title="Navigation Markers"
          description="Download and print the parish QR markers for the SLRP AR Android app."
        />
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center">
          <p className="max-w-2xl text-sm leading-relaxed text-stone-600">
            Place each QR at its assigned parish location. Keep the entire image
            and its white border visible when printing.
          </p>
          <button
            disabled={failed || loaded.length !== unityParishMarkers.length}
            onClick={() => window.print()}
            className="shrink-0 rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            Print QR codes
          </button>
        </div>
        {failed && (
          <p role="alert" className="text-sm text-red-700">
            A marker could not load. Reload this page before printing.
          </p>
        )}
        <div className="qr-print-root grid gap-6 md:grid-cols-2">
          {unityParishMarkers.map((marker) => (
            <article
              key={marker.id}
              className="qr-print-card rounded-2xl border border-stone-200 bg-white p-6 text-center"
            >
              <p className="font-serif font-bold text-[#B22222]">
                St. Lorenzo Ruiz Parish
              </p>
              <h2 className="mt-2 text-xl font-bold">{marker.name}</h2>
              <p className="mt-1 text-sm text-stone-500">{marker.floor}</p>
              <img
                src={marker.image}
                alt={`SLRP AR QR for ${marker.floor}, ${marker.name}`}
                onLoad={() =>
                  setLoaded((ids) =>
                    ids.includes(marker.id) ? ids : [...ids, marker.id],
                  )
                }
                onError={() => setFailed(true)}
                className="mx-auto my-4 aspect-square w-64 max-w-full object-contain"
              />
              <p className="text-sm font-semibold">Scan with SLRP AR</p>
              <a
                href={marker.image}
                download={`${marker.id}.png`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-[#B22222] hover:bg-red-50 print:hidden"
              >
                <Download size={16} /> Download QR
              </a>
            </article>
          ))}
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
