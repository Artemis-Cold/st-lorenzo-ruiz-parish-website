import { useReducer } from "react";
import type { BuildingConfig } from "../types/checkpointNavigation";
import {
  initialNavigation,
  navigationInstruction,
  transitionNavigation,
  type NavigationEvent,
} from "../services/checkpointNavigation";
import { checkpointForTarget } from "../services/targetMapper";

export function useNavigation(building: BuildingConfig) {
  const [state, dispatch] = useReducer(
    (state: ReturnType<typeof initialNavigation>, event: NavigationEvent) =>
      transitionNavigation(state, event, building),
    building.destinations[0].id,
    initialNavigation,
  );
  const report = (event: NavigationEvent) => {
    if (import.meta.env.DEV) console.info("[checkpoint navigation]", event);
    dispatch(event);
  };
  const reportTarget = (index: number, visible: boolean) => {
    const checkpoint = checkpointForTarget(index, building.checkpoints);
    if (checkpoint)
      report({ type: visible ? "found" : "lost", id: checkpoint.id });
  };
  return {
    state,
    instruction: navigationInstruction(state, building),
    report,
    reportTarget,
  };
}
