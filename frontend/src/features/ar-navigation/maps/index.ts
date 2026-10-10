import type { MapProfile } from "../types/checkpointNavigation";
import { houseBuilding } from "./house/config";
import { parishBuilding } from "./parish/config";
import { houseMarkerImages } from "./house/markerAssets";
import houseTargetsUrl from "./house/assets/targets.mind?url";
import housePrintUrl from "./house/assets/markers-print.html?url";
import housePlacementMapUrl from "./house/assets/marker-placement-map.svg?url";
import { parishMarkerImages } from "./parish/markerAssets";
import parishTargetsUrl from "./parish/assets/targets.mind?url";
import parishPrintUrl from "./parish/assets/markers-print.html?url";

export const mapProfiles: readonly MapProfile[] = [
  {
    id: "parish",
    building: parishBuilding,
    markerSet: {
      targetsUrl: parishTargetsUrl,
      targetCount: 17,
      printUrl: parishPrintUrl,
      markers: parishMarkerImages,
    },
    notice:
      "Front stairs are public; altar stairs are staff-only. Access to the right-side walkway, Bell Tower and comfort rooms is through Multipurpose Hall. Guidance ends at each destination’s public entrance or boundary.",
  },
  {
    id: "house",
    building: houseBuilding,
    markerSet: {
      targetsUrl: houseTargetsUrl,
      printUrl: housePrintUrl,
      placementMapUrl: housePlacementMapUrl,
      markers: houseMarkerImages,
    },
    notice:
      "Entrance markers confirm arrival. Between markers use the listed route; turns do not advance automatically. Bathroom 1 requires access through Room 2, and some routes cross the Living Room. Do not follow closed passages.",
  },
];
