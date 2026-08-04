import { useEffect, useState, useCallback } from "react";

// iOS 13+ requires an explicit user gesture to request permission
// for device orientation events. Android generally does not.
type PermissionState = "unknown" | "granted" | "denied" | "unsupported";

export function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<PermissionState>("unknown");

  const requestPermission = useCallback(async () => {
    const DOE = (window as any).DeviceOrientationEvent;

    if (DOE && typeof DOE.requestPermission === "function") {
      try {
        const result = await DOE.requestPermission();
        setPermission(result === "granted" ? "granted" : "denied");
      } catch {
        setPermission("denied");
      }
    } else if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      // Android / browsers that don't require explicit permission
      setPermission("granted");
    } else {
      setPermission("unsupported");
    }
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // webkitCompassHeading is iOS-only and already gives true compass heading.
      const webkitHeading = (event as any).webkitCompassHeading;
      if (typeof webkitHeading === "number") {
        setHeading(webkitHeading);
      } else if (event.alpha !== null) {
        // Fallback for Android: alpha is relative to the device's
        // initial orientation, not true north, but works fine for
        // relative "turn left/right" arrow cues within a session.
        setHeading(360 - event.alpha);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, [permission]);

  return { heading, permission, requestPermission };
}
