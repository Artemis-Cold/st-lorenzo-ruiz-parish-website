import { markerManifest } from "./markers";

const images = import.meta.glob<string>("./assets/marker-H*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

export const houseMarkerImages = markerManifest.map((marker, targetIndex) => ({
  ...marker,
  targetIndex,
  code: `H${String(targetIndex).padStart(2, "0")}`,
  url: images[`./assets/marker-H${String(targetIndex).padStart(2, "0")}.svg`],
}));
