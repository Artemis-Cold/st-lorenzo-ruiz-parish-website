import { ArrowLeft, Printer, ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import { activeMap } from "@/features/ar-navigation/maps/activeMap";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";

export default function NavigationMarkers() {
  const markers = activeMap.markerSet;
  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div>
          <Link
            to="/staff/settings"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#B22222] transition hover:text-[#8F1818]"
          >
            <ArrowLeft size={17} /> Back to Settings
          </Link>
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700">
              <ScanLine size={23} />
            </span>
            <div>
              <h1 className="font-serif text-3xl font-bold text-[#292524]">
                Navigation Markers
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
                Print and place the markers for the active navigation map.
                Verify routes and scanning directions on site before visitor
                use.
              </p>
            </div>
          </div>
        </div>
        {markers && (
          <>
            <a
              href={markers.printUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white"
            >
              <Printer size={18} /> Print all markers
            </a>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {markers.markers.map((marker) => (
                <article
                  key={marker.name}
                  className="rounded-2xl border border-stone-200 bg-white p-5"
                >
                  <h2 className="font-semibold text-stone-900">
                    {marker.name}
                  </h2>
                  <p className="my-3 text-sm text-stone-600">
                    {marker.placement}
                  </p>
                  <a
                    href={marker.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block py-2 text-sm font-semibold text-[#B22222] underline"
                  >
                    Open marker
                  </a>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </StaffDashboardLayout>
  );
}
