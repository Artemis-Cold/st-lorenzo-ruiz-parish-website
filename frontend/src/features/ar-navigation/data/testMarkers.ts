import { markerManifest } from "./markerManifest";

const images = import.meta.glob<string>("../assets/marker-*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

export const testMarkers = markerManifest.map((marker, index) => ({
  ...marker,
  url: images[`../assets/marker-${index}.svg`],
}));
