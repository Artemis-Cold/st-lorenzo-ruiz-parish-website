import { useEffect, useRef, useState } from "react";
import { useDeviceHeading } from "../hooks/useDeviceHeading";
import type { Waypoint } from "../types";

interface ARNavigationViewProps {
  targetBearing: number;
  instruction?: string;
  distanceMeters?: number;
  destinationLabel: string;
  destinations: Waypoint[];
  onChangeDestination: (id: string) => void;
  onPrimaryAction: () => void;
  primaryActionLabel: string;
}

export function ARNavigationView({
  targetBearing,
  instruction,
  distanceMeters,
  destinationLabel,
  destinations,
  onChangeDestination,
  onPrimaryAction,
  primaryActionLabel,
}: ARNavigationViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { heading, permission, requestPermission } = useDeviceHeading();
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch((err) => console.error("Camera access denied", err));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  const rotation = heading !== null ? targetBearing - heading : targetBearing;

  return (
    <div className="ar-nav-root">
      <video ref={videoRef} autoPlay playsInline muted className="ar-nav-video" />

      {/* darken outside the viewfinder so the frame reads as the focus area */}
      <div className="ar-nav-scrim" />

      <div className="ar-nav-frame">
        <span className="ar-nav-corner ar-nav-corner-tl" />
        <span className="ar-nav-corner ar-nav-corner-tr" />
        <span className="ar-nav-corner ar-nav-corner-bl" />
        <span className="ar-nav-corner ar-nav-corner-br" />

        <div className="ar-nav-chevron-group" style={{ transform: `rotate(${rotation}deg)` }}>
          <div className="ar-nav-target-label">
            <span className="ar-nav-target-dot" />
            {destinationLabel}
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <svg
              key={i}
              className="ar-nav-chevron-svg"
              style={{
                bottom: `${i * 15}%`,
                transform: `scale(${1 - i * 0.14})`,
                opacity: 0.85 - i * 0.13,
              }}
              viewBox="0 0 120 50"
            >
              <polygon points="0,50 60,0 120,50 90,50 60,22 30,50" fill="#2dd9c8" />
            </svg>
          ))}
        </div>
      </div>

      <button className="ar-nav-pill" onClick={() => setPickerOpen((v) => !v)}>
        <span>{destinationLabel}</span>
        <span className={`ar-nav-chevron ${pickerOpen ? "ar-nav-chevron-open" : ""}`}>⌄</span>
      </button>

      {pickerOpen && (
        <div className="ar-nav-sheet">
          {destinations.map((wp) => (
            <button
              key={wp.id}
              className="ar-nav-sheet-item"
              onClick={() => {
                onChangeDestination(wp.id);
                setPickerOpen(false);
              }}
            >
              {wp.label}
            </button>
          ))}
        </div>
      )}

      {permission !== "granted" && (
        <button className="ar-nav-compass-btn" onClick={requestPermission}>
          Enable compass
        </button>
      )}

      <div className="ar-nav-bottom">
        {(instruction || distanceMeters) && (
          <div className="ar-nav-instruction">
            {instruction}
            {distanceMeters ? ` · ~${distanceMeters}m` : ""}
          </div>
        )}
        <button className="ar-nav-shutter" onClick={onPrimaryAction} aria-label={primaryActionLabel}>
          <span className="ar-nav-shutter-inner" />
        </button>
      </div>

      <style>{`
        .ar-nav-root {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #000;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
        }
        .ar-nav-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .ar-nav-scrim {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.35) 100%);
          pointer-events: none;
        }
        .ar-nav-frame {
          position: absolute;
          top: 18%;
          left: 8%;
          right: 8%;
          bottom: 26%;
          border-radius: 28px;
        }
        .ar-nav-corner {
          position: absolute;
          width: 28px;
          height: 28px;
          border: 3px solid rgba(255,255,255,0.9);
        }
        .ar-nav-corner-tl { top: 0; left: 0; border-right: none; border-bottom: none; border-top-left-radius: 16px; }
        .ar-nav-corner-tr { top: 0; right: 0; border-left: none; border-bottom: none; border-top-right-radius: 16px; }
        .ar-nav-corner-bl { bottom: 0; left: 0; border-right: none; border-top: none; border-bottom-left-radius: 16px; }
        .ar-nav-corner-br { bottom: 0; right: 0; border-left: none; border-top: none; border-bottom-right-radius: 16px; }
        .ar-nav-chevron-group {
          position: absolute;
          bottom: 8%;
          left: 50%;
          width: 140px;
          height: 70%;
          transform-origin: bottom center;
          translate: -50% 0;
          transition: transform 0.15s linear;
        }
        .ar-nav-chevron-svg {
          position: absolute;
          left: 50%;
          width: 140px;
          transform-origin: bottom center;
          translate: -50% 0;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));
        }
        .ar-nav-target-label {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translate(-50%, -100%);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(20,20,20,0.6);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }
        .ar-nav-target-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2dd9c8;
        }
        .ar-nav-pill {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(20,20,20,0.55);
          backdrop-filter: blur(10px);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
        }
        .ar-nav-chevron { transition: transform 0.15s ease; opacity: 0.8; }
        .ar-nav-chevron-open { transform: rotate(180deg); }
        .ar-nav-sheet {
          position: absolute;
          top: 68px;
          left: 50%;
          transform: translateX(-50%);
          width: min(280px, 80%);
          background: rgba(20,20,20,0.9);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.15);
          overflow: hidden;
          z-index: 5;
        }
        .ar-nav-sheet-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          color: #fff;
          font-size: 14px;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .ar-nav-sheet-item:last-child { border-bottom: none; }
        .ar-nav-compass-btn {
          position: absolute;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.9);
          font-size: 12px;
          font-weight: 600;
          border: none;
        }
        .ar-nav-bottom {
          position: absolute;
          bottom: 28px;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .ar-nav-instruction {
          color: #fff;
          background: rgba(20,20,20,0.55);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 13px;
        }
        .ar-nav-shutter {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          border: 3px solid #fff;
          background: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ar-nav-shutter-inner {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #fff;
        }
      `}</style>
    </div>
  );
}