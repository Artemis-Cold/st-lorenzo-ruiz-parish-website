import type { MapProfile } from "../types/checkpointNavigation";
import { houseBuilding } from "./house/config";
import { parishBuilding } from "./parish/config";

export const mapProfiles: readonly MapProfile[] = [
  {
    id: "parish",
    building: parishBuilding,
    markerSet: null,
    notice:
      "QR checkpoints identify public entrances. Rescan after changing floors. Bell Tower and Comfort Room paths require calibration.",
  },
  {
    id: "house",
    building: houseBuilding,
    markerSet: null,
    notice:
      "QR checkpoints identify entrances. Align at the marked standing point before following the route.",
  },
];
