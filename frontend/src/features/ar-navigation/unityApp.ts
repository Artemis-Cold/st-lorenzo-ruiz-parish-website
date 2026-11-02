import apkUrl from "./AR APP/SLRP.apk?url";
import firstLeft from "./AR APP/parishqrmarkers/F1_LeftStairs_QR.png";
import firstRight from "./AR APP/parishqrmarkers/F1_RightStairs_QR.png";
import secondLeft from "./AR APP/parishqrmarkers/F2_LeftStairs_QR.png";
import secondRight from "./AR APP/parishqrmarkers/F2_RightStairs_QR.png";
import bell from "./AR APP/parishqrmarkers/F1_BellTower_QR.png";
import comfort from "./AR APP/parishqrmarkers/F1_ComfortRoom_QR.png";

// Keep the APK and its supplied QR artwork together. Do not regenerate these
// from the retired browser navigation registry: Unity owns the payload format.
export const slrpApkUrl = apkUrl;
export const unityParishMarkers = [
  {
    id: "F1_LeftStairs_QR",
    name: "Left Stairs",
    floor: "First Floor",
    image: firstLeft,
  },
  {
    id: "F1_RightStairs_QR",
    name: "Right Stairs",
    floor: "First Floor",
    image: firstRight,
  },
  {
    id: "F2_LeftStairs_QR",
    name: "Left Stairs",
    floor: "Second Floor",
    image: secondLeft,
  },
  {
    id: "F2_RightStairs_QR",
    name: "Right Stairs",
    floor: "Second Floor",
    image: secondRight,
  },
  {
    id: "F1_BellTower_QR",
    name: "Bell Tower",
    floor: "First Floor",
    image: bell,
  },
  {
    id: "F1_ComfortRoom_QR",
    name: "Comfort Room",
    floor: "First Floor",
    image: comfort,
  },
] as const;
