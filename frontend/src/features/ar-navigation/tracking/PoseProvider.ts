import type { UserPose } from "../types/navigation";

export interface PoseProvider {
  readonly mode: string;
  start(): Promise<void>;
  stop(): void;
  getPose(): UserPose;
  subscribe(listener: (pose: UserPose) => void): () => void;
}
