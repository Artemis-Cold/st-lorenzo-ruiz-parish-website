import { parishMarkers } from "./markers";

const images = import.meta.glob<string>("./assets/marker-*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

export const parishMarkerImages = parishMarkers.map((marker) => ({
  ...marker,
  url: images[`./assets/marker-${marker.code}.svg`],
}));
