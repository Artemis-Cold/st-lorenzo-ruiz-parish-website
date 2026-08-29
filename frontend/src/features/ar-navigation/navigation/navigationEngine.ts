import type {
  NavigationSnapshot,
  RouteGeometry,
  UserPose,
} from "../types/navigation";
import { trackRoute } from "./routeTracker";

export class NavigationEngine {
  private currentSegmentIndex?: number;
  private route: RouteGeometry;

  constructor(route: RouteGeometry) {
    this.route = route;
  }

  setRoute(route: RouteGeometry) {
    this.route = route;
    this.currentSegmentIndex = undefined;
  }

  update(pose: UserPose): NavigationSnapshot {
    const snapshot = trackRoute(pose, this.route, this.currentSegmentIndex);

    this.currentSegmentIndex = snapshot.closestPoint.segmentIndex;
    return snapshot;
  }

  reset() {
    this.currentSegmentIndex = undefined;
  }
}
