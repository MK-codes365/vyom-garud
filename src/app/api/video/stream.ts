import { NextRequest, NextResponse } from 'next/server';

// Simulated RTSP camera configuration
interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  active: boolean;
}

// Store active cameras and their streams
const activeCameras: Map<string, Camera> = new Map([
  ['main', { id: 'main', name: 'Main Camera', rtspUrl: 'rtsp://localhost:8554/main', active: true }],
  ['thermal', { id: 'thermal', name: 'Thermal Camera', rtspUrl: 'rtsp://localhost:8554/thermal', active: false }],
]);

// Simulated frame counter for demo
let frameCounter = 0;

/**
 * Generates mock H.264 video frame data
 * In production, this would decode actual RTSP stream
 */
function generateMockVideoFrame(width: number = 640, height: number = 480): Uint8Array {
  // Simple pattern: alternating frames with timestamp
  frameCounter++;
  
  // Create a mock H.264 frame (NAL unit start code + data)
  const frameData = new Uint8Array(width * height + 100);
  
  // H.264 NAL unit start code
  frameData[0] = 0x00;
  frameData[1] = 0x00;
  frameData[2] = 0x00;
  frameData[3] = 0x01;
  
  // Add frame number pattern
  for (let i = 4; i < frameData.length; i++) {
    frameData[i] = (frameCounter + i) % 256;
  }
  
  return frameData;
}

/**
 * Converts mock H.264 to JPEG for browser display
 * In production, use ffmpeg or similar to decode H.264
 */
function generateMockJpegFrame(): string {
  // Create a simple gradient image as mock JPEG (base64)
  // This is a minimal valid JPEG for demo purposes
  const timestamp = Date.now() % 1000;
  
  // Generate a simple pattern base64 that changes with time
  const pattern = btoa(`MOCK_VIDEO_FRAME_${frameCounter}_TIME_${timestamp}`);
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" fill="url(#grad)"/>
      <text x="20" y="40" font-size="24" fill="#60a5fa" font-family="monospace">
        Frame: ${frameCounter}
      </text>
      <text x="20" y="80" font-size="16" fill="#94a3b8" font-family="monospace">
        Time: ${timestamp}ms
      </text>
      <rect x="50" y="150" width="${(timestamp % 100) * 4}" height="40" fill="#22c55e" opacity="0.7"/>
      <circle cx="320" cy="240" r="${50 + (frameCounter % 50)}" fill="none" stroke="#3b82f6" stroke-width="2" opacity="0.5"/>
    </svg>
  `)}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cameraId = searchParams.get('camera') || 'main';
  const format = searchParams.get('format') || 'mjpeg';

  const camera = activeCameras.get(cameraId);
  
  if (!camera) {
    return NextResponse.json(
      { error: `Camera ${cameraId} not found` },
      { status: 404 }
    );
  }

  if (format === 'mjpeg') {
    // Motion JPEG stream over HTTP
    return new NextResponse(
      new ReadableStream({
        async start(controller) {
          try {
            for (let i = 0; i < 1000; i++) { // Stream 1000 frames then close
              const frame = generateMockJpegFrame();
              const boundary = '--BOUNDARY\r\nContent-Type: image/svg+xml\r\n';
              const frameData = `${boundary}Content-Length: ${frame.length}\r\n\r\n${frame}\r\n`;
              
              controller.enqueue(frameData);
              await new Promise(resolve => setTimeout(resolve, 33)); // ~30fps
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'multipart/x-mixed-replace; boundary=BOUNDARY',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Connection': 'keep-alive',
        },
      }
    );
  }

  if (format === 'jpeg') {
    // Single JPEG frame
    const frame = generateMockJpegFrame();
    return new NextResponse(frame, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, must-revalidate',
      },
    });
  }

  return NextResponse.json(
    { error: `Format ${format} not supported` },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, cameraId, cameraName, rtspUrl } = body;

  if (action === 'list') {
    return NextResponse.json({
      cameras: Array.from(activeCameras.values()),
      activeCamera: Array.from(activeCameras.values()).find(c => c.active),
    });
  }

  if (action === 'switch') {
    // Switch active camera
    activeCameras.forEach(cam => cam.active = false);
    const camera = activeCameras.get(cameraId);
    if (camera) {
      camera.active = true;
      return NextResponse.json({ success: true, camera });
    }
    return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
  }

  if (action === 'add') {
    // Add new camera
    const newCamera: Camera = {
      id: cameraId || `camera_${Date.now()}`,
      name: cameraName || 'New Camera',
      rtspUrl: rtspUrl || '',
      active: false,
    };
    activeCameras.set(newCamera.id, newCamera);
    return NextResponse.json({ success: true, camera: newCamera });
  }

  if (action === 'remove') {
    // Remove camera
    activeCameras.delete(cameraId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
