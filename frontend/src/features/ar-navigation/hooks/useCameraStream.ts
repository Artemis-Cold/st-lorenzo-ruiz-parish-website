import { useEffect, useRef, useState } from "react";

export function useCameraStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "Camera access is unavailable. Open this page through HTTPS on a supported mobile browser.",
      );
    }

    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = cameraStream;
      setStream(cameraStream);
      return cameraStream;
    } catch (requestError) {
      const message =
        requestError instanceof DOMException &&
        requestError.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in your browser settings and try again."
          : "The rear camera could not be started. Make sure no other application is using it.";
      setError(message);
      throw new Error(message, { cause: requestError });
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
  };

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    },
    [],
  );

  return { stream, error, start, stop };
}
