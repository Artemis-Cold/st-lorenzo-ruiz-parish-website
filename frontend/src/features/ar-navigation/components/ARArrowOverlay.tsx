import { useEffect, useRef } from "react";
import { useDeviceHeading } from "../hooks/useDeviceHeading";

interface ARArrowOverlayProps {
  targetBearing: number; // 0-359, direction the user should face/walk
  instruction?: string;
  distanceMeters?: number;
}

export function ARArrowOverlay({ targetBearing, instruction, distanceMeters }: ARArrowOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { heading, permission, requestPermission } = useDeviceHeading();

  // Start the rear camera as the AR background
  useEffect(() => {
    let stream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch((err) => console.error("Camera access denied", err));

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Arrow rotation = target bearing relative to where the phone is currently facing.
  // If we don't have a heading yet (e.g. permission not granted), default to
  // pointing at the raw target bearing so the arrow is still useful.
  const rotation = heading !== null ? targetBearing - heading : targetBearing;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {permission !== "granted" && (
        <button
          onClick={requestPermission}
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            padding: "8px 16px",
            borderRadius: 8,
          }}
        >
          Enable compass for accurate direction
        </button>
      )}

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          transition: "transform 0.15s linear",
          fontSize: 96,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          pointerEvents: "none",
        }}
        aria-hidden
      >
        ⬆️
      </div>

      {(instruction || distanceMeters) && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.6)",
            color: "white",
            padding: "10px 18px",
            borderRadius: 12,
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          {instruction && <div style={{ fontWeight: 600 }}>{instruction}</div>}
          {distanceMeters && <div style={{ fontSize: 13, opacity: 0.85 }}>~{distanceMeters}m ahead</div>}
        </div>
      )}
    </div>
  );
}
