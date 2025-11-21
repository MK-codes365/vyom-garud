import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

// Reset state every hour to prevent drift
function resetSimulationIfNeeded() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  if (now - simulationState.lastUpdate > oneHour) {
    simulationState = {
      latitude: 34.0522,
      longitude: -118.2437,
      altitude: 100,
      speed: 5,
      battery: 85,
      roll: 0,
      pitch: 0,
      yaw: 0,
      heading: 45,
      lastUpdate: now,
    };
  }
}

// Smooth random walk for realistic drone movement
function updateSimulation() {
  resetSimulationIfNeeded();
  
  const now = Date.now();
  const deltaTime = (now - simulationState.lastUpdate) / 1000; // seconds
  simulationState.lastUpdate = now;
  
  // Smooth circular flight pattern (orbit)
  const time = now / 10000; // Slow time progression
  const radius = 0.0015; // ~150 meters at equator
  
  simulationState.latitude = 34.0522 + Math.sin(time) * radius;
  simulationState.longitude = -118.2437 + Math.cos(time) * radius;
  
  // Smooth altitude changes (simulate climbing/descending)
  simulationState.altitude = 100 + Math.sin(time * 0.5) * 30;
  
  // Smooth speed variations
  simulationState.speed = 8 + Math.sin(time * 0.3) * 4;
  
  // Gradual heading changes
  simulationState.heading = (time * 50) % 360;
  
  // Slight attitude changes
  simulationState.roll = Math.sin(time * 0.7) * 15;
  simulationState.pitch = Math.cos(time * 0.6) * 10;
  simulationState.yaw = simulationState.heading;
  
  // Gradual battery drain
  const flightTime = (now - (simulationState.lastUpdate - 3600000)) / 1000 / 3600; // hours
  simulationState.battery = Math.max(20, 95 - flightTime * 5);
  
  return {
    latitude: parseFloat(simulationState.latitude.toFixed(6)),
    longitude: parseFloat(simulationState.longitude.toFixed(6)),
    altitude: parseFloat(simulationState.altitude.toFixed(1)),
    speed: parseFloat(simulationState.speed.toFixed(1)),
    battery: parseFloat(simulationState.battery.toFixed(1)),
    roll: parseFloat(simulationState.roll.toFixed(2)),
    pitch: parseFloat(simulationState.pitch.toFixed(2)),
    yaw: parseFloat(simulationState.yaw.toFixed(2)),
    heartbeat: true,
    flightMode: 'AUTO',
  };
}

export async function GET(request: NextRequest) {
  // For WebSocket upgrade, Next.js doesn't natively support WebSocket in API routes
  // So we'll return SSE (Server-Sent Events) which provides real-time streaming
  // This is a valid alternative to WebSocket for unidirectional data

  if (request.headers.get('accept') === 'text/event-stream') {
    const encoder = new TextEncoder();
    let interval: NodeJS.Timeout | null = null;
    let isClosed = false;
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream telemetry data every 100ms (10 Hz)
          interval = setInterval(async () => {
            if (isClosed || !interval) return;
            
            try {
              // Try to fetch from unified simulator on localhost (only works in development)
              let telemetryData = null;
              
              try {
                const response = await fetch('http://127.0.0.1:5000', {
                  method: 'GET',
                  cache: 'no-store',
                  signal: AbortSignal.timeout(2000), // 2 second timeout
                });

                if (response.ok) {
                  const data = await response.json();
                  telemetryData = data.telemetry;
                }
              } catch (error) {
                // Simulator not available, use smooth fallback simulation
              }

              // If no data from simulator, use smooth fallback telemetry
              if (!telemetryData) {
                telemetryData = updateSimulation();
              }

              if (!isClosed) {
                const event = `data: ${JSON.stringify({
                  type: 'telemetry',
                  telemetry: telemetryData,
                })}\n\n`;
                
                controller.enqueue(encoder.encode(event));
              }
            } catch (error) {
              console.error('Stream fetch error:', error);
            }
          }, 100);

          // Cleanup on client disconnect
          request.signal.addEventListener('abort', () => {
            isClosed = true;
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
            controller.close();
          });
        } catch (error) {
          console.error('Stream error:', error);
          isClosed = true;
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
          controller.close();
        }
      },
      cancel() {
        isClosed = true;
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Fallback: return HTTP response
  try {
    const response = await fetch('http://127.0.0.1:5000', {
      method: 'GET',
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Telemetry fetch error:', error);
  }

  // Return error response
  return NextResponse.json({
    success: false,
    message: 'Simulator not available',
  }, { status: 503 });
}
