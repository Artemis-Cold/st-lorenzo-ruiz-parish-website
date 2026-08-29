import type { NavigationPoint, UserPose } from "../types/navigation";
import { normalizeHeading } from "../utils/navigationMath";
import type { PoseProvider } from "./PoseProvider";

interface IOSPermissionEventConstructor {
  requestPermission?: () => Promise<"granted" | "denied">;
}

interface IOSDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

const STEP_LENGTH_METERS = 0.68;
const MINIMUM_STEP_INTERVAL_MS = 320;
const STEP_ACCELERATION_THRESHOLD = 1.35;

export class IOSDevelopmentTracker implements PoseProvider {
  readonly mode = "iOS camera + motion estimation";

  private pose: UserPose;
  private listeners = new Set<(pose: UserPose) => void>();
  private started = false;
  private lastRawHeading: number | null = null;
  private calibrationRawHeading: number | null = null;
  private calibrationWorldHeading = 0;
  private lastStepAt = 0;
  private accelerationBaseline = 0;

  constructor(initialPosition: NavigationPoint, initialHeading = 0) {
    this.pose = {
      ...initialPosition,
      heading: normalizeHeading(initialHeading),
      pitch: -18,
      roll: 0,
    };
    this.calibrationWorldHeading = normalizeHeading(initialHeading);
  }

  async start(): Promise<void> {
    if (this.started) return;

    if (
      typeof DeviceOrientationEvent === "undefined" ||
      typeof DeviceMotionEvent === "undefined"
    ) {
      throw new Error(
        "This browser does not expose device orientation and motion sensors.",
      );
    }

    await Promise.all([
      this.requestPermission(
        DeviceOrientationEvent as unknown as IOSPermissionEventConstructor,
        "orientation",
      ),
      this.requestPermission(
        DeviceMotionEvent as unknown as IOSPermissionEventConstructor,
        "motion",
      ),
    ]);

    window.addEventListener("deviceorientation", this.handleOrientation, true);
    window.addEventListener("devicemotion", this.handleMotion, true);
    this.started = true;
    this.emit();
  }

  stop(): void {
    window.removeEventListener(
      "deviceorientation",
      this.handleOrientation,
      true,
    );
    window.removeEventListener("devicemotion", this.handleMotion, true);
    this.started = false;
  }

  getPose(): UserPose {
    return { ...this.pose };
  }

  subscribe(listener: (pose: UserPose) => void): () => void {
    this.listeners.add(listener);
    listener(this.getPose());

    return () => this.listeners.delete(listener);
  }

  calibrate(position: NavigationPoint, worldHeading: number) {
    this.calibrationRawHeading = this.lastRawHeading;
    this.calibrationWorldHeading = normalizeHeading(worldHeading);
    this.pose = {
      ...this.pose,
      ...position,
      heading: this.calibrationWorldHeading,
      timestamp: performance.now(),
    };
    this.emit();
  }

  private requestPermission = async (
    eventConstructor: IOSPermissionEventConstructor,
    sensorName: string,
  ) => {
    if (!eventConstructor.requestPermission) return;

    const permission = await eventConstructor.requestPermission();
    if (permission !== "granted") {
      throw new Error(`Access to device ${sensorName} was not granted.`);
    }
  };

  private handleOrientation = (event: DeviceOrientationEvent) => {
    const iosEvent = event as IOSDeviceOrientationEvent;
    const rawHeading =
      typeof iosEvent.webkitCompassHeading === "number"
        ? iosEvent.webkitCompassHeading
        : typeof event.alpha === "number"
          ? normalizeHeading(360 - event.alpha)
          : null;

    if (rawHeading === null) return;

    this.lastRawHeading = rawHeading;
    if (this.calibrationRawHeading === null) {
      this.calibrationRawHeading = rawHeading;
    }

    const headingChange =
      rawHeading - (this.calibrationRawHeading ?? rawHeading);
    const screenAngle = window.screen.orientation?.angle ?? 0;
    const beta = event.beta ?? 72;
    const gamma = event.gamma ?? 0;

    this.pose = {
      ...this.pose,
      heading: normalizeHeading(this.calibrationWorldHeading + headingChange),
      pitch: Math.max(-75, Math.min(25, beta - 90)),
      roll: Math.max(-45, Math.min(45, -gamma + screenAngle)),
      timestamp: performance.now(),
    };
    this.emit();
  };

  private handleMotion = (event: DeviceMotionEvent) => {
    const acceleration =
      event.acceleration ?? event.accelerationIncludingGravity;
    if (
      acceleration?.x === null ||
      acceleration?.y === null ||
      acceleration?.z === null ||
      acceleration?.x === undefined ||
      acceleration?.y === undefined ||
      acceleration?.z === undefined
    ) {
      return;
    }

    const magnitude = Math.hypot(
      acceleration.x,
      acceleration.y,
      acceleration.z,
    );
    this.accelerationBaseline =
      this.accelerationBaseline * 0.8 + magnitude * 0.2;
    const impulse = magnitude - this.accelerationBaseline;
    const now = performance.now();

    if (
      impulse < STEP_ACCELERATION_THRESHOLD ||
      now - this.lastStepAt < MINIMUM_STEP_INTERVAL_MS
    ) {
      return;
    }

    this.lastStepAt = now;
    const headingRadians = (this.pose.heading * Math.PI) / 180;
    this.pose = {
      ...this.pose,
      x: this.pose.x + Math.sin(headingRadians) * STEP_LENGTH_METERS,
      z: this.pose.z + Math.cos(headingRadians) * STEP_LENGTH_METERS,
      timestamp: now,
    };
    this.emit();
  };

  private emit() {
    const pose = this.getPose();
    this.listeners.forEach((listener) => listener(pose));
  }
}
