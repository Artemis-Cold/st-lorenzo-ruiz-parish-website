interface QRDetector {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}
type QRConstructor = {
  new (options: { formats: string[] }): QRDetector;
  getSupportedFormats(): Promise<string[]>;
};
const detectorClass = () =>
  (globalThis as unknown as { BarcodeDetector?: QRConstructor })
    .BarcodeDetector;

export async function navigationSupported() {
  const detector = detectorClass();
  if (
    !isSecureContext ||
    !navigator.xr ||
    !detector ||
    !/Android/i.test(navigator.userAgent)
  )
    return false;
  try {
    return (
      (await navigator.xr.isSessionSupported("immersive-ar")) &&
      (await detector.getSupportedFormats()).includes("qr_code")
    );
  } catch {
    return false;
  }
}

export function scanQR(
  video: HTMLVideoElement,
  found: (value: string) => boolean,
  failed: (message: string) => void,
) {
  let stopped = false;
  let stream: MediaStream | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const dispose = () => {
    stopped = true;
    clearTimeout(timer);
    stream?.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  };
  void (async () => {
    try {
      const Detector = detectorClass();
      if (!Detector)
        throw new Error("QR scanning is unsupported in this browser.");
      const detector = new Detector({ formats: ["qr_code"] });
      const acquired = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      if (stopped) {
        acquired.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = acquired;
      video.srcObject = stream;
      await video.play();
      const tick = async () => {
        if (stopped) return;
        try {
          if (video.readyState >= 2) {
            for (const code of await detector.detect(video)) {
              if (stopped) return;
              if (found(code.rawValue)) {
                dispose();
                return;
              }
            }
          }
        } catch {
          if (!stopped) {
            dispose();
            failed("QR scanning stopped. Please retry.");
          }
          return;
        }
        if (!stopped) timer = setTimeout(() => void tick(), 200);
      };
      void tick();
    } catch {
      if (!stopped) {
        dispose();
        failed("Camera unavailable. Allow camera access, then retry.");
      }
    }
  })();
  return dispose;
}
