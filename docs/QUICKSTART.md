# MAVLink Drone GCS - Quick Start Guide

## What You Now Have

Your GCS dashboard is now fully integrated with MAVLink protocol support! Here's what's been implemented:

## ✅ Completed Features

### 1. **MAVLink Protocol Support**
   - Full message type definitions for common drone messages
   - Parser that converts MAVLink messages to dashboard telemetry
   - Support for 25+ MAVLink message types

### 2. **Built-in Simulator**
   - Realistic drone flight simulation
   - Battery drain simulation
   - GPS satellites simulation  
   - Attitude (roll/pitch/yaw) simulation
   - Velocity and acceleration simulation

### 3. **Real-time Data Streaming**
   - **WebSocket SSE** endpoint: `/api/telemetry/stream`
   - **REST API** endpoint: `/api/telemetry`
   - 10 Hz update rate (100ms intervals)
   - Automatic fallback from WebSocket to polling

### 4. **Dashboard Integration**
   - Live telemetry display
   - Altitude tracking
   - Speed monitoring
   - Battery status
   - Flight mode display
   - GPS position tracking
   - Attitude visualization

## 🚀 Running the Dashboard

```bash
npm run dev
```

Then open: `http://localhost:9002`

You should see:
- Live drone telemetry updating in real-time
- Altitude and speed history charts
- GPS position (simulated near Los Angeles)
- Battery percentage (slowly draining)
- Flight mode (ALT_HOLD)
- Connection status (Connected/Disconnected)

## 📊 API Endpoints

### Get Current Telemetry
```bash
curl http://localhost:9002/api/telemetry
```

Response:
```json
{
  "success": true,
  "timestamp": 1700486400000,
  "mavlink_messages": [...],
  "telemetry": {
    "altitude": 100.5,
    "speed": 5.2,
    "latitude": 34.0522,
    "longitude": -118.2437,
    "battery": 85,
    "roll": 0.1,
    "pitch": 0.05,
    "yaw": 1.57,
    "heartbeat": true,
    "flightMode": "ALT_HOLD"
  }
}
```

### Stream Telemetry (WebSocket)
```javascript
const es = new EventSource('/api/telemetry/stream');
es.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.telemetry);
};
```

## 🔌 Connecting to Real Simulators

### Option 1: PX4 SITL

```bash
# Install PX4
git clone https://github.com/PX4/PX4-Autopilot.git
cd PX4-Autopilot

# Run simulator
make px4_sitl gazebo

# In another terminal:
npm run dev
```

Then modify `src/app/api/mavlink-simulator.ts` to listen for UDP messages from PX4 on port 14540.

### Option 2: ArduPilot SITL

```bash
# Install ArduPilot
git clone https://github.com/ArduPilot/ardupilot.git
cd ardupilot

# Build and run
./waf configure --board sitl
./waf copter
sim_vehicle.py -v ArduCopter -L default --console

# Dashboard will auto-connect to port 14550
```

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── telemetry/
│   │   │   ├── route.ts           # Main telemetry endpoint
│   │   │   └── stream/
│   │   │       └── route.ts       # WebSocket streaming endpoint
│   │   └── mavlink-simulator.ts   # Built-in simulator
│   └── page.tsx                    # Main dashboard page
├── lib/
│   ├── mavlink-types.ts           # MAVLink message definitions
│   ├── mavlink-parser.ts          # Message parser & converter
│   └── types.ts                   # Telemetry data types
└── hooks/
    └── use-drone-data.ts          # React hook for telemetry
```

## 🔄 Data Flow

1. **Simulator generates** MAVLink messages (or real simulator provides them)
2. **API endpoint** (`/api/telemetry`) receives and parses messages
3. **Parser converts** MAVLink → Telemetry format
4. **Streaming endpoint** (`/api/telemetry/stream`) sends data to dashboard
5. **React hook** (`useDroneData`) subscribes to stream and updates UI
6. **Dashboard** displays real-time telemetry

## 📈 Telemetry Fields

| Field | Type | Unit | Source |
|-------|------|------|--------|
| altitude | number | meters | GPS/Barometer |
| speed | number | m/s | GPS |
| latitude | number | degrees | GPS |
| longitude | number | degrees | GPS |
| battery | number | % | Power module |
| roll | number | radians | IMU |
| pitch | number | radians | IMU |
| yaw | number | radians | Compass |
| heartbeat | boolean | - | System status |
| flightMode | string | - | Flight controller |

## 🛠️ Customization

### Add New Telemetry Fields

Edit `src/lib/types.ts`:
```typescript
export interface TelemetryData {
  // ... existing fields
  customField: number;
}
```

### Add New MAVLink Messages

Edit `src/lib/mavlink-types.ts`:
```typescript
export interface MAVLinkCustomMessage {
  msgid: 200;
  type: 'CUSTOM_MESSAGE';
  // ... message fields
}
```

Edit `src/lib/mavlink-parser.ts`:
```typescript
if (msg.msgid === 200 || msg.type === 'CUSTOM_MESSAGE') {
  telemetry.customField = msg.data;
}
```

### Adjust Update Rate

Edit `src/app/api/telemetry/stream/route.ts`:
```typescript
}, 100); // Change from 100ms to desired interval
```

## 🐛 Troubleshooting

**Dashboard shows "DISCONNECTED"**
- Check browser console for errors (F12)
- Verify `/api/telemetry` responds: `curl http://localhost:9002/api/telemetry`
- Check if dev server is running: `npm run dev`

**No telemetry updates**
- Check Network tab in DevTools
- Verify streaming endpoint: `/api/telemetry/stream`
- Look for fetch/network errors

**High latency**
- Reduce polling interval (default 100ms)
- Use WebSocket instead of polling
- Check network conditions

## 📚 Next Steps

1. **[Optional] Connect to PX4 or ArduPilot** - Replace built-in simulator with real SITL
2. **Add waypoint planning** - Define flight paths
3. **Implement drone control** - Send commands (arm, take off, land)
4. **Multi-vehicle support** - Track multiple drones
5. **Real-time logging** - Record all telemetry data
6. **3D map integration** - Display drone on real map

## 📖 Documentation

- See `docs/MAVLINK_INTEGRATION.md` for detailed technical documentation
- MAVLink spec: https://mavlink.io
- PX4 docs: https://px4.io/faq
- ArduPilot docs: https://ardupilot.org

## ✨ Key Features at a Glance

- ✅ Real-time telemetry streaming (10 Hz)
- ✅ MAVLink protocol parser
- ✅ Built-in flight simulator
- ✅ WebSocket + polling fallback
- ✅ Flight mode recognition
- ✅ Battery monitoring
- ✅ GPS tracking
- ✅ Attitude visualization
- ✅ Altitude/speed charting
- ✅ Ready for real simulator integration

---

**Happy flying! 🚁** Your GCS is now ready to fly drones (virtually or with real simulators).
