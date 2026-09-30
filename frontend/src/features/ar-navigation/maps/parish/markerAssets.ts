import { parishMarkers } from "./markers";

const generatedImages = import.meta.glob<string>("./assets/marker-*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const naturalImages = import.meta.glob<string>("./assets/target-*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});

export const parishMarkerImages = parishMarkers.map((marker) => {
  // A photographed landmark replaces its generated marker at the same stable
  // target index. Codes without a photograph retain the printable fallback.
  const url =
    naturalImages[`./assets/target-${marker.code}.jpg`] ??
    generatedImages[`./assets/marker-${marker.code}.svg`];
  if (!url) throw new Error(`Missing recognition image for ${marker.code}`);
  return { ...marker, url };
});
