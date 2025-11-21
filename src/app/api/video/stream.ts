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
 * Generate a simple PNG frame as base64
 * This creates a visual test pattern that changes over time
 */
function generatePngFrame(cameraId: string): string {
  frameCounter++;
  const timestamp = Date.now();
  
  // Create a canvas-like drawing with SVG (simpler than PNG generation)
  // This creates an animated test pattern
  const colors = cameraId === 'thermal' 
    ? { bg: '#ff6b1a', accent: '#ff0000', text: '#ffffff' }
    : { bg: '#1e40af', accent: '#3b82f6', text: '#e0e7ff' };
  
  const animValue = (frameCounter * 5) % 360;
  const barWidth = ((frameCounter * 3) % 200) + 50;
  
  const svg = `
    <svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="640" height="480" fill="url(#grad)"/>
      
      <!-- Top bar with camera info -->
      <rect width="640" height="60" fill="rgba(0,0,0,0.7)"/>
      <text x="20" y="35" font-size="28" font-weight="bold" fill="${colors.text}" font-family="monospace">
        ${cameraId === 'thermal' ? '🌡️ THERMAL' : '📷 MAIN'} CAMERA
      </text>
      
      <!-- Frame counter and timestamp -->
      <text x="20" y="470" font-size="12" fill="${colors.accent}" font-family="monospace">
        Frame: ${frameCounter} | Time: ${(timestamp % 10000).toFixed(0)}ms
      </text>
      
      <!-- Animated visual indicator -->
      <circle cx="320" cy="240" r="100" fill="none" stroke="${colors.accent}" stroke-width="2" opacity="0.5"/>
      <circle cx="320" cy="240" r="${60 + Math.sin(frameCounter * 0.1) * 20}" fill="none" stroke="${colors.accent}" stroke-width="3" opacity="0.7"/>
      
      <!-- Animated bar -->
      <rect x="50" y="180" width="${barWidth}" height="40" fill="${colors.accent}" opacity="0.6"/>
      
      <!-- Grid pattern -->
      ${Array.from({length: 8}, (_, i) => 
        `<line x1="${i * 80}" y1="70" x2="${i * 80}" y2="470" stroke="${colors.accent}" stroke-width="1" opacity="0.1"/>`
      ).join('')}
      ${Array.from({length: 6}, (_, i) => 
        `<line x1="0" y1="${70 + i * 67}" x2="640" y2="${70 + i * 67}" stroke="${colors.accent}" stroke-width="1" opacity="0.1"/>`
      ).join('')}
      
      <!-- FPS indicator -->
      <text x="560" y="40" font-size="14" fill="${colors.accent}" font-family="monospace" text-anchor="end">
        ~30 FPS
      </text>
      
      <!-- Resolution info -->
      <text x="560" y="55" font-size="12" fill="${colors.text}" font-family="monospace" text-anchor="end">
        640x480
      </text>
      
      <!-- Test pattern elements -->
      <rect x="100" y="290" width="40" height="40" fill="${colors.accent}" opacity="0.5"/>
      <rect x="180" y="290" width="40" height="40" fill="${colors.accent}" opacity="0.6"/>
      <rect x="260" y="290" width="40" height="40" fill="${colors.accent}" opacity="0.7"/>
      <rect x="340" y="290" width="40" height="40" fill="${colors.accent}" opacity="0.8"/>
      <rect x="420" y="290" width="40" height="40" fill="${colors.accent}" opacity="0.9"/>
      
      <!-- Rotating indicator -->
      <g transform="translate(320, 120)">
        <circle r="30" fill="none" stroke="${colors.accent}" stroke-width="2" opacity="0.5"/>
        <line x1="0" y1="0" x2="0" y2="-30" stroke="${colors.accent}" stroke-width="2" 
              transform="rotate(${animValue})" opacity="0.8"/>
      </g>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cameraId = searchParams.get('camera') || 'main';
  const format = searchParams.get('format') || 'jpeg';

  const camera = activeCameras.get(cameraId);
  
  if (!camera) {
    return NextResponse.json(
      { error: `Camera ${cameraId} not found` },
      { status: 404 }
    );
  }

  if (format === 'jpeg') {
    // Single JPEG frame
    const frame = generatePngFrame(cameraId);
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
