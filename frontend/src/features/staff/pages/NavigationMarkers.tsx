import { ArrowLeft, ExternalLink, Map, Printer, ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import { activeMap } from "@/features/ar-navigation/maps/activeMap";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";

export default function NavigationMarkers() {
  const markers = activeMap.markerSet;
  const direction = (facing?: number) =>
    ({ 0: "Up", 90: "Right", 180: "Down", 270: "Left" })[facing ?? -1] ??
    "Follow placement map";
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
                Follow each placement and scanning direction so navigation
                instructions remain correctly aligned.
              </p>
            </div>
          </div>
        </div>
        {markers && (
          <>
            <div className="flex flex-wrap gap-3">
              {markers.placementMapUrl && (
                <a
                  href={markers.placementMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#B22222] bg-white px-5 py-3 font-semibold text-[#B22222] transition hover:bg-red-50"
                >
                  <Map size={18} /> View placement map
                </a>
              )}
              <a
                href={markers.printUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white transition hover:bg-[#8F1818]"
              >
                <Printer size={18} /> Print all markers
              </a>
            </div>

            {markers.placementMapUrl && (
              <a
                href={markers.placementMapUrl}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-3xl border border-stone-200 bg-white p-3 shadow-sm"
              >
                <div className="relative overflow-hidden rounded-2xl bg-stone-50">
                  <img
                    src={markers.placementMapUrl}
                    alt="House navigation marker placement map"
                    className="mx-auto max-h-150 w-full object-contain"
                  />
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-[#B22222] shadow-sm">
                    Open full map <ExternalLink size={13} />
                  </span>
                </div>
              </a>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {markers.markers.map((marker) => (
                <article
                  key={marker.name}
                  className="rounded-2xl border border-stone-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold text-stone-900">
                      {marker.name}
                    </h2>
                    {marker.code && (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-[#B22222]">
                        {marker.code}
                      </span>
                    )}
                  </div>
                  <p className="my-3 text-sm text-stone-600">
                    {marker.placement}
                  </p>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Face {direction(marker.facing)} on the map
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
