/**
 * MAVLink Simulator Server
 * Simulates drone telemetry data in MAVLink format
 * This replaces a real simulator like PX4 SITL or ArduPilot SITL for demo purposes
 */

interface SimulatorState {
  timestamp: number;
  latitude: number;
  longitude: number;
  altitude: number;
  roll: number;
  pitch: number;
  yaw: number;
  vx: number; // velocity x
  vy: number; // velocity y
  vz: number; // velocity z
  battery: number;
  satellites: number;
  gpsFix: number;
  isConnected: boolean;
}

let simulatorState: SimulatorState = {
  timestamp: Date.now(),
  latitude: 34.0522 * 1e7, // Los Angeles in 1e7 format
  longitude: -118.2437 * 1e7,
  altitude: 100 * 1000, // 100m in mm
  roll: 0,
  pitch: 0,
  yaw: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  battery: 85,
  satellites: 12,
  gpsFix: 3, // 3D fix
  isConnected: true,
};

/**
 * Updates simulator state with simulated drone behavior
 */
export function updateSimulatorState(): SimulatorState {
  const now = Date.now();
  const timeDelta = (now - simulatorState.timestamp) / 1000; // seconds
  simulatorState.timestamp = now;

  // Simulate smooth movement
  if (Math.random() > 0.9) {
    simulatorState.vx += (Math.random() - 0.5) * 2; // ±1 cm/s change
    simulatorState.vy += (Math.random() - 0.5) * 2;
  }

  // Clamp velocities
  simulatorState.vx = Math.max(-500, Math.min(500, simulatorState.vx)); // ±5 m/s max
  simulatorState.vy = Math.max(-500, Math.min(500, simulatorState.vy));

  // Update position based on velocity (cm/s in MAVLink)
  const latChange = (simulatorState.vy / 100) * timeDelta / 111000; // approx meters per degree
  const lonChange = (simulatorState.vx / 100) * timeDelta / (111000 * Math.cos(simulatorState.latitude / 1e7 * Math.PI / 180));

  simulatorState.latitude += latChange * 1e7;
  simulatorState.longitude += lonChange * 1e7;

  // Simulate altitude changes
  if (Math.random() > 0.95) {
    simulatorState.vz += (Math.random() - 0.5) * 50;
  }
  simulatorState.vz = Math.max(-100, Math.min(200, simulatorState.vz)); // climb/descent rate
  simulatorState.altitude += simulatorState.vz * timeDelta;

  // Simulate attitude
  simulatorState.roll = Math.sin(now / 2000) * 0.2; // gentle rolling
  simulatorState.pitch = Math.sin(now / 3000) * 0.15; // gentle pitching
  simulatorState.yaw += (Math.random() - 0.5) * 0.01; // gradual yaw change
  simulatorState.yaw = simulatorState.yaw % (2 * Math.PI); // wrap to 0-2π

  // Simulate battery drain
  if (simulatorState.isConnected) {
    simulatorState.battery -= 0.001; // Slow battery drain
    simulatorState.battery = Math.max(0, Math.min(100, simulatorState.battery));
  }

  // Simulate GPS satellites
  if (Math.random() > 0.98) {
    simulatorState.satellites = Math.max(4, simulatorState.satellites + (Math.random() > 0.5 ? 1 : -1));
    simulatorState.satellites = Math.min(20, simulatorState.satellites);
  }

  return simulatorState;
}

/**
 * Generates MAVLink-format messages from simulator state
 */
export function generateMAVLinkMessages() {
  const state = updateSimulatorState();

  const messages = [
    {
      msgid: 0, // HEARTBEAT
      type: 'HEARTBEAT',
      autopilot: 3, // ArduPilot
      system_status: state.isConnected ? 4 : 1, // 4=ACTIVE, 1=STANDBY
      custom_mode: 2, // ALT_HOLD mode
    },
    {
      msgid: 33, // GLOBAL_POSITION_INT
      type: 'GLOBAL_POSITION_INT',
      lat: Math.round(state.latitude),
      lon: Math.round(state.longitude),
      alt: Math.round(state.altitude),
      relative_alt: Math.round(state.altitude - 100000), // 100m ground reference
      vx: Math.round(state.vx),
      vy: Math.round(state.vy),
      vz: Math.round(state.vz),
      hdg: Math.round((state.yaw * 180 / Math.PI) * 100), // heading in degrees * 100
    },
    {
      msgid: 30, // ATTITUDE
      type: 'ATTITUDE',
      roll: state.roll,
      pitch: state.pitch,
      yaw: state.yaw,
      rollspeed: 0,
      pitchspeed: 0,
      yawspeed: 0,
    },
    {
      msgid: 74, // VFR_HUD
      type: 'VFR_HUD',
      airspeed: Math.sqrt(state.vx * state.vx + state.vy * state.vy) / 100, // m/s
      groundspeed: Math.sqrt(state.vx * state.vx + state.vy * state.vy) / 100,
      heading: Math.round((state.yaw * 180 / Math.PI + 360) % 360),
      throttle: 50,
      alt: state.altitude / 1000, // meters
      climb: state.vz / 100, // m/s
    },
    {
      msgid: 1, // SYSTEM_STATUS
      type: 'SYSTEM_STATUS',
      voltage_battery: 12600, // mV (3S LiPo)
      current_battery: 1000, // cA (10A)
      battery_remaining: Math.round(state.battery),
      load: 350, // 35.0% load
    },
    {
      msgid: 24, // GPS_RAW_INT
      type: 'GPS_RAW_INT',
      lat: Math.round(state.latitude),
      lon: Math.round(state.longitude),
      alt: Math.round(state.altitude),
      eph: 100, // Horizontal position uncertainty in cm
      epv: 150, // Vertical position uncertainty in cm
      vel: Math.round(Math.sqrt(state.vx * state.vx + state.vy * state.vy)),
      cog: Math.round((state.yaw * 180 / Math.PI + 360) % 360 * 100),
      fix_type: state.gpsFix,
      satellites_visible: state.satellites,
    },
  ];

  return messages;
}
