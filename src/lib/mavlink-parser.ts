/**
 * MAVLink Message Parser
 * Converts raw MAVLink binary data or JSON messages to telemetry
 */

import {
  MAVLinkMessageID,
  type MAVLinkMessage,
  type TelemetryFromMAVLink,
} from './mavlink-types';

/**
 * Parses MAVLink messages (assuming JSON format from simulator)
 * Real MAVLink uses binary format, but simulators often provide JSON
 */
export function parseMAVLinkMessage(data: unknown): Partial<TelemetryFromMAVLink> {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const msg = data as Record<string, any>;
  const telemetry: Partial<TelemetryFromMAVLink> = {};

  // ATTITUDE message (msgid=30)
  if (msg.msgid === MAVLinkMessageID.ATTITUDE || msg.type === 'ATTITUDE') {
    telemetry.roll = msg.roll || 0; // radians
    telemetry.pitch = msg.pitch || 0; // radians
    telemetry.yaw = msg.yaw || 0; // radians
  }

  // GLOBAL_POSITION_INT message (msgid=33)
  if (msg.msgid === MAVLinkMessageID.GLOBAL_POSITION_INT || msg.type === 'GLOBAL_POSITION_INT') {
    telemetry.latitude = (msg.lat || 0) / 1e7; // Convert from 1e7 to degrees
    telemetry.longitude = (msg.lon || 0) / 1e7; // Convert from 1e7 to degrees
    telemetry.altitude = (msg.alt || 0) / 1000; // Convert from mm to meters
    telemetry.speed = Math.hypot((msg.vx || 0) / 100, (msg.vy || 0) / 100); // Convert from cm/s to m/s
  }

  // GPS_RAW_INT message (msgid=24)
  if (msg.msgid === MAVLinkMessageID.GPS_RAW_INT || msg.type === 'GPS_RAW_INT') {
    telemetry.latitude = (msg.lat || 0) / 1e7;
    telemetry.longitude = (msg.lon || 0) / 1e7;
    telemetry.altitude = (msg.alt || 0) / 1000;
    telemetry.speed = (msg.vel || 0) / 100; // Convert from cm/s to m/s
    telemetry.satellites = msg.satellites_visible || 0;
    telemetry.gpsStatus = getGPSFixType(msg.fix_type || 0);
  }

  // VFR_HUD message (msgid=74)
  if (msg.msgid === MAVLinkMessageID.VFR_HUD || msg.type === 'VFR_HUD') {
    telemetry.airspeed = msg.airspeed || 0;
    telemetry.speed = msg.groundspeed || 0;
    telemetry.altitude = msg.alt || 0;
    telemetry.throttle = msg.throttle || 0;
    telemetry.climbRate = msg.climb || 0;
  }

  // HEARTBEAT message (msgid=0)
  if (msg.msgid === MAVLinkMessageID.HEARTBEAT || msg.type === 'HEARTBEAT') {
    telemetry.heartbeat = msg.system_status !== 0 && msg.system_status !== 1; // Active or Standby
    telemetry.flightMode = getFlightMode(msg.custom_mode || 0, msg.autopilot || 0);
  }

  // BATTERY_STATUS message
  if (msg.type === 'BATTERY_STATUS' || msg.msgid === 147) {
    telemetry.battery = msg.battery_remaining || 0;
  }

  // SYSTEM_STATUS message (msgid=1)
  if (msg.msgid === 1 || msg.type === 'SYSTEM_STATUS') {
    telemetry.battery = msg.battery_remaining || 0;
  }

  return telemetry;
}

/**
 * Gets flight mode name from mode value
 * This varies by autopilot type (ArduCopter, ArduPlane, PX4, etc.)
 */
function getFlightMode(mode: number, autopilot: number): string {
  // ArduCopter modes (most common for multirotor)
  if (autopilot === 3) {
    const arduCopterModes: Record<number, string> = {
      0: 'STABILIZE',
      1: 'ACRO',
      2: 'ALT_HOLD',
      3: 'AUTO',
      4: 'GUIDED',
      5: 'LOITER',
      6: 'RTL',
      7: 'CIRCLE',
      9: 'LAND',
      10: 'OF_LOITER',
      11: 'DRIFT',
      13: 'SPORT',
      14: 'FLIP',
      15: 'AUTOTUNE',
      16: 'POSHOLD',
      17: 'BRAKE',
      18: 'THROW',
      19: 'AVOID_ADSB',
      20: 'GUIDED_NOGPS',
      21: 'SMART_RTL',
      22: 'FLOWHOLD',
      23: 'FOLLOW',
      24: 'ZIGZAG',
      25: 'SYSTEMID',
      26: 'AUTOROTATE',
      27: 'AUTO_RTL',
      28: 'TURTLE',
    };
    return arduCopterModes[mode] || `MODE_${mode}`;
  }

  // ArduPlane modes
  if (autopilot === 3 && mode >= 0 && mode <= 27) {
    const arduPlaneModes: Record<number, string> = {
      0: 'MANUAL',
      1: 'CIRCLE',
      2: 'STABILIZE',
      3: 'TRAINING',
      4: 'ACRO',
      5: 'FBWA',
      6: 'FBWB',
      7: 'CRUISE',
      8: 'AUTOTUNE',
      10: 'AUTO',
      11: 'RTL',
      12: 'LOITER',
      14: 'AVOID_ADSB',
      15: 'GUIDED',
      16: 'INITIALIZING',
      17: 'QSTABILIZE',
      18: 'QHOVER',
      19: 'QLOITER',
      20: 'QLAND',
      21: 'QRTL',
      22: 'QAUTOTUNE',
      23: 'QACRO',
    };
    return arduPlaneModes[mode] || `MODE_${mode}`;
  }

  // PX4/Pixhawk modes
  if (autopilot === 12) {
    const px4Modes: Record<number, string> = {
      0: 'MANUAL',
      1: 'ALTITUDE',
      2: 'POSITION',
      3: 'AUTO_MISSION',
      4: 'AUTO_LOITER',
      5: 'AUTO_RTL',
      6: 'ACRO',
      7: 'OFFBOARD',
      8: 'STABILIZED',
      9: 'RATTITUDE',
      10: 'AUTO_TAKEOFF',
      11: 'AUTO_LAND',
      12: 'AUTO_FOLLOW_TARGET',
      13: 'AUTO_PRECLAND',
      14: 'ORBIT',
      15: 'AUTO_VTOL_TAKEOFF',
      16: 'AUTO_VTOL_LAND',
    };
    return px4Modes[mode] || `MODE_${mode}`;
  }

  return `MODE_${mode}`;
}

/**
 * Gets GPS fix type name
 */
function getGPSFixType(fixType: number): string {
  const fixTypes: Record<number, string> = {
    0: 'NO_GPS',
    1: 'GPS_FIX_2D',
    2: 'GPS_FIX_3D',
    3: 'GPS_FIX_DGPS',
    4: 'GPS_FIX_RTK_FLOAT',
    5: 'GPS_FIX_RTK',
    6: 'GPS_FIX_STATIC',
    7: 'GPS_FIX_PPP',
  };
  return fixTypes[fixType] || `UNKNOWN_FIX_${fixType}`;
}

/**
 * Converts radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Converts degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
