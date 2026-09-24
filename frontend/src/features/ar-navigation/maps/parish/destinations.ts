import type { Destination } from "../../types/checkpointNavigation.ts";
export const parishDestinations: readonly Destination[] = [
  { id: "function-hall", name: "Function Hall", nodeId: "b_function" },
  {
    id: "multipurpose-hall",
    name: "Multipurpose Hall",
    nodeId: "b_multipurpose",
  },
  { id: "parish-office", name: "Parish Office", nodeId: "b_office" },
  { id: "parish-store", name: "Parish Store", nodeId: "b_store" },
  { id: "bell-tower", name: "Bell Tower", nodeId: "bell_entry" },
  { id: "comfort-room", name: "Comfort Room", nodeId: "comfort_entry" },
  { id: "altar", name: "Altar", nodeId: "c_altar" },
  { id: "choir", name: "Choir Stand", nodeId: "c_choir" },
  { id: "sacristy", name: "Sacristy", nodeId: "c_sacristy" },
  { id: "candles", name: "Candle Stand", nodeId: "c_candle" },
];
