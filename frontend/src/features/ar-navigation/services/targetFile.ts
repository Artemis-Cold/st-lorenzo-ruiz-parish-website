import { decode } from "@msgpack/msgpack";
import { markerManifest } from "../data/markerManifest.ts";

export function validateTargetFile(
  buffer: ArrayBuffer,
  expectedCount: number = markerManifest.length,
) {
  if (buffer.byteLength === 0 || buffer.byteLength > 30 * 1024 * 1024)
    throw new Error("Choose a .mind file smaller than 30 MB.");
  let decoded: unknown;
  try {
    decoded = decode(new Uint8Array(buffer));
  } catch {
    throw new Error("This file is not a valid compiled MindAR target file.");
  }
  const data = decoded as {
    v?: number;
    dataList?: {
      targetImage?: { width?: number; height?: number };
      matchingData?: unknown[];
      trackingData?: unknown[];
    }[];
  } | null;
  if (
    !data ||
    data.v !== 2 ||
    !Array.isArray(data.dataList) ||
    data.dataList.length !== expectedCount
  ) {
    throw new Error(
      `Compile exactly ${expectedCount} targets in the listed order using MindAR 1.2.5.`,
    );
  }
  if (
    data.dataList.some(
      (target) =>
        !target?.targetImage ||
        !(target.targetImage.width! > 0) ||
        !(target.targetImage.height! > 0) ||
        !Array.isArray(target.matchingData) ||
        !target.matchingData.length ||
        !Array.isArray(target.trackingData) ||
        !target.trackingData.length,
    )
  ) {
    throw new Error(
      "Target data is incomplete. Recompile the original marker images.",
    );
  }
  return data.dataList.length;
}
