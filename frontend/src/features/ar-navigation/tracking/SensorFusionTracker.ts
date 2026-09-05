import type { NavigationPoint, UserPose } from "../types/navigation";
import {
  normalizeHeading,
  signedHeadingDifference,
} from "../utils/navigationMath";
import type { PoseProvider } from "./PoseProvider";

interface SensorPermissionConstructor {
  requestPermission?: () => Promise<"granted" | "denied">;
}

interface IOSDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

interface TrackingSensitivityProfile {
  stepLengthMeters: number;
  minimumStepIntervalMs: number;
  stepAccelerationThreshold: number;
  stepResetThreshold: number;
  significantHeadingChangeDegrees: number;
  headingStabilityRequiredMs: number;
  rotationRateThreshold: number;
  headingSmoothingFactor: number;
}

/**
 * Tune these profiles using a measured one-metre test path. Increasing the
 * acceleration threshold or minimum interval rejects more false steps.
 */
export const SENSOR_TRACKING_PROFILES = {
  ios: {
    stepLengthMeters: 0.55,
    minimumStepIntervalMs: 650,
    stepAccelerationThreshold: 0.95,
    stepResetThreshold: 0.35,
    significantHeadingChangeDegrees: 3,
    headingStabilityRequiredMs: 900,
    rotationRateThreshold: 22,
    headingSmoothingFactor: 0.22,
  },
  android: {
    stepLengthMeters: 0.5,
    minimumStepIntervalMs: 750,
    stepAccelerationThreshold: 1.25,
    stepResetThreshold: 0.45,
    significantHeadingChangeDegrees: 2.5,
    headingStabilityRequiredMs: 1100,
    rotationRateThreshold: 20,
    headingSmoothingFactor: 0.14,
  },
} satisfies Record<"ios" | "android", TrackingSensitivityProfile>;

const MOTION_DIAGNOSTIC_INTERVAL_MS = 250;

export class SensorFusionTracker implements PoseProvider {
  private readonly isAndroid = /Android/i.test(navigator.userAgent);
  private readonly profile = this.isAndroid
    ? SENSOR_TRACKING_PROFILES.android
    : SENSOR_TRACKING_PROFILES.ios;

  readonly mode = this.isAndroid
    ? "Camera + Android motion sensors"
    : "Camera + iPhone motion sensors";

  private pose: UserPose;
  private listeners = new Set<(pose: UserPose) => void>();
  private started = false;
  private lastRawHeading: number | null = null;
  private smoothedRawHeading: number | null = null;
  private calibrationRawHeading: number | null = null;
  private calibrationWorldHeading = 0;
  private lastStepAt = 0;
  private lastMotionDiagnosticAt = 0;
  private accelerationBaseline: number | null = null;
  private stepDetectorArmed = true;
  private detectedSteps = 0;
  private headingStabilityReference: number | null = null;
  private lastSignificantHeadingChangeAt = 0;
  private lastRotationAt = 0;
  private lastAbsoluteOrientationAt = 0;
  private orientationReadyResolver: (() => void) | null = null;
  private orientationReadyTimer: number | null = null;

  constructor(initialPosition: NavigationPoint, initialHeading = 0) {
    this.calibrationWorldHeading = normalizeHeading(initialHeading);
    this.pose = {
      ...initialPosition,
      heading: this.calibrationWorldHeading,
      pitch: -18,
      roll: 0,
      detectedSteps: 0,
      motionIntensity: 0,
      motionSensorActive: false,
      orientationSensorActive: false,
      stepTrackingPaused: true,
    };
  }

  async start(): Promise<void> {
    if (this.started) return;

    if (
      typeof DeviceOrientationEvent === "undefined" ||
      typeof DeviceMotionEvent === "undefined"
    ) {
      throw new Error(
        "This browser does not expose the orientation and motion sensors needed for automatic navigation.",
      );
    }

    await Promise.all([
      this.requestPermission(
        DeviceOrientationEvent as unknown as SensorPermissionConstructor,
        "orientation",
      ),
      this.requestPermission(
        DeviceMotionEvent as unknown as SensorPermissionConstructor,
        "motion",
      ),
    ]);

    this.lastRawHeading = null;
    this.smoothedRawHeading = null;
    window.addEventListener("deviceorientation", this.handleOrientation, true);
    window.addEventListener(
      "deviceorientationabsolute",
      this.handleAbsoluteOrientation as EventListener,
      true,
    );
    window.addEventListener("devicemotion", this.handleMotion, true);
    this.started = true;

    try {
      await this.waitForOrientation();
      this.emit();
    } catch (error) {
      this.stop();
      throw error;
    }
  }

  stop(): void {
    window.removeEventListener(
      "deviceorientation",
      this.handleOrientation,
      true,
    );
    window.removeEventListener(
      "deviceorientationabsolute",
      this.handleAbsoluteOrientation as EventListener,
      true,
    );
    window.removeEventListener("devicemotion", this.handleMotion, true);

    if (this.orientationReadyTimer !== null) {
      window.clearTimeout(this.orientationReadyTimer);
      this.orientationReadyTimer = null;
    }

    this.orientationReadyResolver = null;
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

  calibrate(position: NavigationPoint, worldHeading: number): void {
    const now = performance.now();
    this.calibrationRawHeading = this.lastRawHeading;
    this.calibrationWorldHeading = normalizeHeading(worldHeading);
    this.accelerationBaseline = null;
    this.stepDetectorArmed = true;
    this.detectedSteps = 0;
    this.lastStepAt = 0;
    this.headingStabilityReference = this.lastRawHeading;
    this.lastSignificantHeadingChangeAt = now;
    this.lastRotationAt = now;
    this.pose = {
      ...this.pose,
      ...position,
      heading: this.calibrationWorldHeading,
      detectedSteps: 0,
      motionIntensity: 0,
      stepTrackingPaused: true,
      timestamp: now,
    };
    this.emit();
  }

  private requestPermission = async (
    eventConstructor: SensorPermissionConstructor,
    sensorName: string,
  ) => {
    if (!eventConstructor.requestPermission) return;

    const permission = await eventConstructor.requestPermission();
    if (permission !== "granted") {
      throw new Error(`Access to device ${sensorName} was not granted.`);
    }
  };

  private waitForOrientation = () => {
    if (this.lastRawHeading !== null) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      this.orientationReadyResolver = resolve;
      this.orientationReadyTimer = window.setTimeout(() => {
        this.orientationReadyResolver = null;
        this.orientationReadyTimer = null;
        reject(
          new Error(
            "No orientation data was received. Allow motion sensors for this HTTPS site, then reload the page.",
          ),
        );
      }, 4000);
    });
  };

  private markOrientationReady = () => {
    if (this.orientationReadyTimer !== null) {
      window.clearTimeout(this.orientationReadyTimer);
      this.orientationReadyTimer = null;
    }
    this.orientationReadyResolver?.();
    this.orientationReadyResolver = null;
  };

  private handleAbsoluteOrientation = (event: Event) => {
    this.lastAbsoluteOrientationAt = performance.now();
    this.updateOrientation(event as DeviceOrientationEvent, "absolute");
  };

  private handleOrientation = (event: DeviceOrientationEvent) => {
    if (performance.now() - this.lastAbsoluteOrientationAt < 1000) return;
    this.updateOrientation(event, event.absolute ? "absolute" : "relative");
  };

  private updateOrientation = (
    event: DeviceOrientationEvent,
    source: "absolute" | "relative",
  ) => {
    const iosEvent = event as IOSDeviceOrientationEvent;
    const iosCompassHeading = iosEvent.webkitCompassHeading;
    const usesIOSCompass = typeof iosCompassHeading === "number";
    const rawHeading = usesIOSCompass
      ? iosCompassHeading
      : typeof event.alpha === "number"
        ? normalizeHeading(360 - event.alpha)
        : null;

    if (rawHeading === null) return;

    if (this.smoothedRawHeading === null) {
      this.smoothedRawHeading = rawHeading;
    } else {
      const delta = signedHeadingDifference(
        this.smoothedRawHeading,
        rawHeading,
      );
      this.smoothedRawHeading = normalizeHeading(
        this.smoothedRawHeading + delta * this.profile.headingSmoothingFactor,
      );
    }

    const filteredHeading = this.smoothedRawHeading;
    const now = performance.now();
    this.markOrientationReady();
    this.lastRawHeading = filteredHeading;
    this.calibrationRawHeading ??= filteredHeading;

    if (this.headingStabilityReference === null) {
      this.headingStabilityReference = filteredHeading;
      this.lastSignificantHeadingChangeAt = now;
    } else if (
      Math.abs(
        signedHeadingDifference(
          this.headingStabilityReference,
          filteredHeading,
        ),
      ) >= this.profile.significantHeadingChangeDegrees
    ) {
      this.headingStabilityReference = filteredHeading;
      this.lastSignificantHeadingChangeAt = now;
    }

    const headingChange = signedHeadingDifference(
      this.calibrationRawHeading,
      filteredHeading,
    );
    const screenAngle = window.screen.orientation?.angle ?? 0;
    const beta = event.beta ?? 72;
    const gamma = event.gamma ?? 0;

    this.pose = {
      ...this.pose,
      heading: normalizeHeading(this.calibrationWorldHeading + headingChange),
      pitch: Math.max(-75, Math.min(25, beta - 90)),
      roll: Math.max(-45, Math.min(45, -gamma + screenAngle)),
      orientationSensorActive: true,
      orientationSource: usesIOSCompass ? "ios-compass" : source,
      stepTrackingPaused: this.isTurning(now),
      timestamp: now,
    };
    this.emit();
  };

  private handleMotion = (event: DeviceMotionEvent) => {
    const acceleration =
      event.accelerationIncludingGravity ?? event.acceleration;

    if (
      acceleration?.x == null ||
      acceleration.y == null ||
      acceleration.z == null
    ) {
      return;
    }

    const now = performance.now();
    const rotationRate = event.rotationRate;
    const rotationMagnitude = Math.hypot(
      rotationRate?.alpha ?? 0,
      rotationRate?.beta ?? 0,
      rotationRate?.gamma ?? 0,
    );

    if (rotationMagnitude >= this.profile.rotationRateThreshold) {
      this.lastRotationAt = now;
    }

    const magnitude = Math.hypot(
      acceleration.x,
      acceleration.y,
      acceleration.z,
    );

    if (this.accelerationBaseline === null) {
      this.accelerationBaseline = magnitude;
      this.updateMotionDiagnostics(0, true, now);
      return;
    }

    const impulse = Math.abs(magnitude - this.accelerationBaseline);
    this.accelerationBaseline =
      this.accelerationBaseline * 0.9 + magnitude * 0.1;

    if (impulse <= this.profile.stepResetThreshold) {
      this.stepDetectorArmed = true;
    }

    if (this.isTurning(now)) {
      this.stepDetectorArmed = true;
      this.updateMotionDiagnostics(impulse, true, now);
      return;
    }

    if (
      !this.stepDetectorArmed ||
      impulse < this.profile.stepAccelerationThreshold ||
      now - this.lastStepAt < this.profile.minimumStepIntervalMs
    ) {
      this.updateMotionDiagnostics(impulse, false, now);
      return;
    }

    this.stepDetectorArmed = false;
    this.lastStepAt = now;
    this.detectedSteps += 1;
    const headingRadians = (this.pose.heading * Math.PI) / 180;

    this.pose = {
      ...this.pose,
      x: this.pose.x + Math.sin(headingRadians) * this.profile.stepLengthMeters,
      z: this.pose.z - Math.cos(headingRadians) * this.profile.stepLengthMeters,
      detectedSteps: this.detectedSteps,
      motionIntensity: impulse,
      motionSensorActive: true,
      stepTrackingPaused: false,
      timestamp: now,
    };
    this.emit();
  };

  private isTurning(now: number): boolean {
    const hold = this.profile.headingStabilityRequiredMs;
    return (
      now - this.lastSignificantHeadingChangeAt < hold ||
      now - this.lastRotationAt < hold
    );
  }

  private updateMotionDiagnostics(
    impulse: number,
    paused: boolean,
    now: number,
  ): void {
    if (now - this.lastMotionDiagnosticAt < MOTION_DIAGNOSTIC_INTERVAL_MS) {
      return;
    }

    this.lastMotionDiagnosticAt = now;
    this.pose = {
      ...this.pose,
      motionSensorActive: true,
      motionIntensity: impulse,
      stepTrackingPaused: paused,
      timestamp: now,
    };
    this.emit();
  }

  private emit(): void {
    const pose = this.getPose();
    this.listeners.forEach((listener) => listener(pose));
  }
}
