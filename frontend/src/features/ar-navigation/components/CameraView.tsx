import { useEffect, useRef } from "react";

interface CameraViewProps {
  stream: MediaStream;
}

export default function CameraView({ stream }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;
    void video.play();

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      aria-label="Rear camera view"
      className="absolute inset-0 size-full object-cover"
    />
  );
}
