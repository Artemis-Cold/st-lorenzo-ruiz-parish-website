import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (decodedId: string) => void;
  active: boolean; // control mounting from parent to fully stop camera when not needed
}

const SCANNER_ELEMENT_ID = "ar-nav-qr-reader";

export function QRScanner({ onScan, active }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!active) return;

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;
    let isRunning = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          onScan(decodedText.trim());
        },
        () => {
          // decode errors fire constantly while no QR is in frame; ignore
        }
      )
      .then(() => {
        isRunning = true;
      })
      .catch((err) => {
        console.error("Unable to start QR scanner", err);
      });

    return () => {
      if (isRunning) {
        scanner.stop().catch(() => {
          /* already stopped */
        });
      }
    };
  }, [active, onScan]);

  if (!active) return null;

  return (
    <div>
      <div id={SCANNER_ELEMENT_ID} style={{ width: "100%" }} />
      <p style={{ textAlign: "center", fontSize: 14, opacity: 0.7 }}>
        Point your camera at the QR code near you
      </p>
    </div>
  );
}
