/**
 * MAVLink Protocol Message Types
 * Reference: https://mavlink.io/en/messages/common.html
 */

export enum MAVLinkMessageID {
  HEARTBEAT = 0,
  SYSTEM_TIME = 2,
  PARAM_VALUE = 22,
  GPS_RAW_INT = 24,
  SCALED_IMU = 26,
  RAW_IMU = 27,
  ATTITUDE = 30,
  GLOBAL_POSITION_INT = 33,
  LOCAL_POSITION_NED = 32,
  SERVO_OUTPUT_RAW = 36,
  MISSION_REQUEST = 40,
  MISSION_ITEM = 39,
  MISSION_ACK = 47,
  VFR_HUD = 74,
  COMMAND_ACK = 77,
  MISSION_CURRENT = 42,
  NAV_CONTROLLER_OUTPUT = 62,
  EXTENDED_SYS_STATE = 245,
}

export interface MAVLinkHeartbeat {
  msgid: MAVLinkMessageID.HEARTBEAT;
  type: number; // MAV_TYPE (1=Fixed wing, 2=Quadrotor, etc.)
  autopilot: number; // MAV_AUTOPILOT (0=Generic, 1=Reserved, 2=SLUGS, etc.)
  base_mode: number; // MAV_MODE_FLAG
  custom_mode: number; // Flight mode (depends on autopilot)
  system_status: number; // MAV_STATE (0=Boot, 1=Calibrate, 2=Standby, 3=Active, etc.)
  mavlink_version: number;
}

export interface MAVLinkGPSRawInt {
  msgid: MAVLinkMessageID.GPS_RAW_INT;
  time_usec: number;
  lat: number; // Latitude in degrees * 1e7
  lon: number; // Longitude in degrees * 1e7
  alt: number; // Altitude in mm
  eph: number; // Horizontal dilution of precision
  epv: number; // Vertical dilution of precision
  vel: number; // Ground speed in cm/s
  cog: number; // Course over ground in degrees * 100
  fix_type: number; // 0=No GPS, 1=GPS fix, 2=DGPS, 3=RTK, 4=RTK Fixed, 5=Estimated, 6=Manual input mode
  satellites_visible: number; // Number of visible satellites
}

export interface MAVLinkAttitude {
  msgid: MAVLinkMessageID.ATTITUDE;
  time_boot_ms: number; // Time since system boot in milliseconds
  roll: number; // Roll angle in radians
  pitch: number; // Pitch angle in radians
  yaw: number; // Yaw angle in radians
  rollspeed: number; // Roll angular speed in rad/s
  pitchspeed: number; // Pitch angular speed in rad/s
  yawspeed: number; // Yaw angular speed in rad/s
}

export interface MAVLinkGlobalPositionInt {
  msgid: MAVLinkMessageID.GLOBAL_POSITION_INT;
  time_boot_ms: number;
  lat: number; // Latitude in degrees * 1e7
  lon: number; // Longitude in degrees * 1e7
  alt: number; // Altitude in mm MSL
  relative_alt: number; // Altitude above ground in mm
  vx: number; // Ground X speed (latitude, positive north) in cm/s
  vy: number; // Ground Y speed (longitude, positive east) in cm/s
  vz: number; // Ground Z speed (altitude, positive down) in cm/s
  hdg: number; // Heading (yaw angle) in degrees * 100
}

export interface MAVLinkVFRHud {
  msgid: MAVLinkMessageID.VFR_HUD;
  airspeed: number; // Airspeed in m/s
  groundspeed: number; // Ground speed in m/s
  heading: number; // Heading in degrees (0-360)
  throttle: number; // Throttle as percentage 0-100
  alt: number; // Altitude in meters MSL
  climb: number; // Climb rate in m/s
}

export interface MAVLinkBatteryStatus {
  msgid: number;
  battery_remaining: number; // 0-100 percentage
  battery_voltage: number; // Voltage in mV
  current_battery: number; // Current in cA (10mA)
}

export interface MAVLinkSystemStatus {
  msgid: number;
  onboard_control_sensors_present: number;
  onboard_control_sensors_enabled: number;
  onboard_control_sensors_health: number;
  load: number; // System load (0-1000 in %)
  voltage_battery: number; // Battery voltage in mV
  current_battery: number; // Battery current in cA
  battery_remaining: number; // Battery remaining percentage 0-100
  drop_rate_comm: number; // Droprate of packets that were corrupted
  errors_comm: number; // Errors that have occurred, encoded as flags
  errors_count1: number;
  errors_count2: number;
  errors_count3: number;
  errors_count4: number;
}

export type MAVLinkMessage =
  | MAVLinkHeartbeat
  | MAVLinkGPSRawInt
  | MAVLinkAttitude
  | MAVLinkGlobalPositionInt
  | MAVLinkVFRHud
  | MAVLinkBatteryStatus
  | MAVLinkSystemStatus;

/**
 * Converts MAVLink message to telemetry data
 */
export interface TelemetryFromMAVLink {
  altitude: number; // meters
  speed: number; // m/s (ground speed)
  latitude: number; // degrees
  longitude: number; // degrees
  battery: number; // 0-100 percentage
  roll: number; // radians
  pitch: number; // radians
  yaw: number; // radians (heading)
  heartbeat: boolean;
  flightMode: string;
  satellites?: number;
  gpsStatus?: string;
  airspeed?: number;
  throttle?: number;
  climbRate?: number;
}
