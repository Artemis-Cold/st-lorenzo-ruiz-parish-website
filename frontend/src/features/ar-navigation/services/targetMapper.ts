import type { Checkpoint } from "../types/checkpointNavigation.ts";

export function checkpointForTarget(
  targetIndex: number,
  checkpoints: readonly Checkpoint[],
) {
  return (
    checkpoints.find((checkpoint) => checkpoint.targetIndex === targetIndex) ??
    null
  );
}
