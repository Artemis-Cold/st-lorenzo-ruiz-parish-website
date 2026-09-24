import type { MapProfile } from "../types/checkpointNavigation";
import { houseBuilding } from "./house/config";
import { parishBuilding } from "./parish/config";
import { testMarkers } from "../data/testMarkers";
import targetsUrl from "../assets/targets.mind?url";
import printUrl from "../assets/markers-print.html?url";
import { parishMarkerImages } from "./parish/markerAssets";
import parishTargetsUrl from "./parish/assets/targets.mind?url";
import parishPrintUrl from "./parish/assets/markers-print.html?url";

export const mapProfiles: readonly MapProfile[] = [
  {
    id: "parish",
    name: "Parish layout — preview",
    building: parishBuilding,
    markerSet: {
      targetsUrl: parishTargetsUrl,
      printUrl: parishPrintUrl,
      markers: parishMarkerImages,
    },
    notice:
      "Draft map for preview and supervised field testing, not visitor-ready navigation. Front stairs are public; altar stairs are staff-only. Access to the right-side walkway, Bell Tower and bathrooms is through Multipurpose Hall, not directly from the Entrance-stair landing. Entrances and public boundaries only; distances, marker positions and facing directions require on-site verification.",
  },
  {
    id: "house",
    name: "Test layout",
    building: houseBuilding,
    markerSet: { targetsUrl, printUrl, markers: testMarkers },
    notice:
      "Entrance markers confirm arrival. Between markers use the listed route; turns do not advance automatically. Bathroom 1 requires access through Room 2, and some routes cross the Living Room. Do not follow closed passages.",
  },
];
