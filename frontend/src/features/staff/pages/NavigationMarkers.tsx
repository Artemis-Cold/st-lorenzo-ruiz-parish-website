import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { activeMap } from "@/features/ar-navigation/maps/activeMap";
import { qrPayload } from "@/features/ar-navigation/services/qrNavigation";
import { parishMarkers } from "@/features/ar-navigation/maps/parish/markers";
import { markerManifest } from "@/features/ar-navigation/maps/house/markers";
import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import "./navigationQR.css";

export default function NavigationMarkers() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [error, setError] = useState(false);
  const checkpoints = activeMap.building.checkpoints.filter(
    (point) => point.targetIndex !== null,
  );
  const placements = activeMap.id === "parish" ? parishMarkers : markerManifest;
  useEffect(() => {
    let active = true;
    void Promise.all(
      activeMap.building.checkpoints
        .filter((p) => p.targetIndex !== null)
        .map(
          async (point) =>
            [
              point.id,
              await QRCode.toDataURL(qrPayload(activeMap.id, point.id), {
                width: 600,
                margin: 4,
                errorCorrectionLevel: "M",
              }),
            ] as const,
        ),
    )
      .then((values) => {
        if (active) setImages(Object.fromEntries(values));
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <Link to="/staff/settings" className="text-[#B22222]">
          ← Back to Settings
        </Link>
        <h1 className="font-serif text-3xl font-bold">Navigation QR Codes</h1>
        <p>
          Replace the old image markers with these QR codes. Mark a standing
          point at each public-side checkpoint. The user must face the QR in the
          listed direction when aligning AR.
        </p>
        <button
          disabled={Object.keys(images).length !== checkpoints.length}
          onClick={() => window.print()}
          className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          Print QR codes
        </button>
        {error && (
          <p role="alert">QR generation failed. Reload this page to retry.</p>
        )}
        <div className="qr-print-root grid gap-6 md:grid-cols-2">
          {checkpoints.map((point) => (
            <article
              key={point.id}
              className="qr-print-card rounded-2xl border border-stone-200 bg-white p-6 text-center"
            >
              <p className="font-serif font-bold text-[#B22222]">
                St. Lorenzo Ruiz Parish
              </p>
              <h2 className="mt-2 text-xl font-bold">{point.name}</h2>
              {images[point.id] && (
                <img
                  src={images[point.id]}
                  alt={`Navigation QR for ${point.name}`}
                  className="mx-auto w-64"
                />
              )}
              <p className="text-sm">Scan in AR Navigation</p>
              <p className="mt-3 text-xs text-stone-600">
                {placements.find((p) => p.nodeId === point.nodeId)?.placement}
              </p>
              <p className="mt-2 text-xs">
                Map: {activeMap.id} · {point.id} · Facing {point.facing}° from
                plan north
              </p>
            </article>
          ))}
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
