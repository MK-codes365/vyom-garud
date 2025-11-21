import { generateMAVLinkMessages } from '../mavlink-simulator';
import { parseMAVLinkMessage } from '@/lib/mavlink-parser';

export const dynamic = 'force-dynamic';

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
      // Unified simulator not available, fall back to built-in simulator
      console.log('Unified simulator not available, using built-in simulator');
    }

    // Fall back to built-in MAVLink simulator
    try {
      const mavlinkMessages = generateMAVLinkMessages();

      // Merge parsed messages
      for (const msg of mavlinkMessages) {
        const parsed = parseMAVLinkMessage(msg);
        telemetry = { ...telemetry, ...parsed };
      }

      // Return both raw MAVLink messages and parsed telemetry
      return Response.json({
        success: true,
        timestamp: Date.now(),
        mavlink_messages: mavlinkMessages,
        telemetry: telemetry,
      });
    } catch (error) {
      console.error('Error generating MAVLink telemetry:', error);
      // Return fallback telemetry if MAVLink generation fails
      return Response.json({
        success: true,
        timestamp: Date.now(),
        telemetry: telemetry,
      });
    }
  } catch (error) {
    console.error('Error generating telemetry:', error);
    return Response.json(
      { success: false, error: 'Failed to generate telemetry' },
      { status: 500 }
    );
  }
}
