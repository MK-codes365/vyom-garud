import { generateMAVLinkMessages } from '../mavlink-simulator';
import { parseMAVLinkMessage } from '@/lib/mavlink-parser';

export const dynamic = 'force-dynamic';

// In-memory state for smooth drone simulation
let simulationState = {
  latitude: 34.0522,
  longitude: -118.2437,
  altitude: 100,
  speed: 5,
  battery: 85,
  roll: 0,
  pitch: 0,
  yaw: 0,
  heading: 45,
  lastUpdate: Date.now(),
};

// Smooth simulation function (same as websocket route)
function getSmoothTelemetry() {
  const now = Date.now();
  const time = now / 10000; // Slow time progression
  const radius = 0.0015; // ~150 meters at equator
  
  return {
    latitude: 34.0522 + Math.sin(time) * radius,
    longitude: -118.2437 + Math.cos(time) * radius,
    altitude: 100 + Math.sin(time * 0.5) * 30,
    speed: 8 + Math.sin(time * 0.3) * 4,
    battery: Math.max(20, 95 - (now % 3600000) / 1000 / 360 * 5),
    roll: Math.sin(time * 0.7) * 15,
    pitch: Math.cos(time * 0.6) * 10,
    yaw: (time * 50) % 360,
    heartbeat: true,
    flightMode: 'AUTO',
  };
}

export async function GET(request: Request) {
  try {
    // Try to get data from unified simulator first
    let telemetry: Record<string, any> = {
      altitude: 100,
      speed: 0,
      latitude: 34.0522,
      longitude: -118.2437,
      battery: 85,
      roll: 0,
      pitch: 0,
      yaw: 0,
      heartbeat: true,
      flightMode: 'MANUAL',
    };

    try {
      // Fetch from unified simulator on port 5000 (with timeout)
      const simulatorResponse = await fetch('http://127.0.0.1:5000', {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });

      if (simulatorResponse.ok) {
        const simulatorData = await simulatorResponse.json();
        if (simulatorData.telemetry) {
          telemetry = { ...telemetry, ...simulatorData.telemetry };
          return Response.json({
            success: true,
            telemetry,
          });
        }
      }
    } catch (error) {
      // Unified simulator not available, fall back to smooth simulator
      console.log('Unified simulator not available, using smooth fallback simulator');
    }

    // Fall back to smooth simulation
    try {
      const smoothTelemetry = getSmoothTelemetry();
      telemetry = { ...telemetry, ...smoothTelemetry };

      // Return telemetry with smooth simulation
      return Response.json({
        success: true,
        timestamp: Date.now(),
        telemetry: telemetry,
      });
    } catch (error) {
      console.error('Error generating telemetry:', error);
      // Return fallback telemetry if everything fails
      return Response.json({
        success: true,
        timestamp: Date.now(),
        telemetry: telemetry,
      });
    }
  } catch (error) {
    console.error('Error in telemetry endpoint:', error);
    return Response.json(
      { success: false, error: 'Failed to generate telemetry' },
      { status: 500 }
    );
  }
}
