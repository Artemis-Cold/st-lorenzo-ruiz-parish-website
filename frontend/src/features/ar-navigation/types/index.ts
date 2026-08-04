// Core data types for the AR indoor navigation feature

export interface Waypoint {
  id: string;          // matches the QR code value scanned at this physical point
  label: string;        // human-readable name, e.g. "Main Entrance"
  isDestinationOption?: boolean; // show in the "where do you want to go" list
}

export interface Edge {
  from: string;         // Waypoint id
  to: string;           // Waypoint id
  bearing: number;      // compass bearing in degrees (0-359) to face when walking from -> to
  distanceMeters?: number; // optional, for display ("approx. 8m ahead")
  instruction?: string; // optional human hint, e.g. "Turn left at the pillar"
}

export interface RouteStep {
  from: Waypoint;
  to: Waypoint;
  bearing: number;
  instruction?: string;
  distanceMeters?: number;
}
