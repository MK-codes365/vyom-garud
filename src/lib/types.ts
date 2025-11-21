export interface TelemetryData {
  altitude: number;
  speed: number;
  latitude: number;
  longitude: number;
  battery: number;
  roll: number;
  pitch: number;
  yaw: number;
  heartbeat: boolean;
  flightMode: string;
}

export interface Waypoint {
  id: number;
  lat: number;
  lng: number;
  alt: number;
  actions: string;
}
