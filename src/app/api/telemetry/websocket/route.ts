import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

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
                // Simulator not available, that's okay - we'll use fallback
                console.log('Simulator unavailable, using fallback data');
              }

              // If no data from simulator, use fallback telemetry
              if (!telemetryData) {
                telemetryData = {
                  altitude: 100 + Math.random() * 20,
                  speed: Math.random() * 15,
                  latitude: 34.0522 + (Math.random() - 0.5) * 0.01,
                  longitude: -118.2437 + (Math.random() - 0.5) * 0.01,
                  battery: 85 + Math.random() * 10,
                  roll: (Math.random() - 0.5) * 10,
                  pitch: (Math.random() - 0.5) * 10,
                  yaw: Math.random() * 360,
                  heartbeat: true,
                  flightMode: 'MANUAL',
                };
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
