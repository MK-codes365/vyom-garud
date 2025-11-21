# GCS Dashboard - MAVLink Drone Control Station

A modern web-based Ground Control Station (GCS) with real-time MAVLink protocol support for drone simulation and control.

## 🎯 Features

- **Real-time Telemetry Streaming** - 10Hz updates via WebSocket or polling
- **MAVLink Protocol Support** - Parse 25+ common MAVLink messages
- **Built-in Simulator** - Realistic drone flight simulation out of the box
- **Flight Dashboard** - Real-time altitude, speed, battery, and GPS tracking
- **Flight Path Planning** - Waypoint management and mission planning
- **Manual Controls** - Virtual joystick and drone control interface
- **Geofencing** - Define virtual boundaries for safe flight
- **Live Charts** - Altitude and speed history visualization
- **Responsive Design** - Works on desktop and tablet

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

```bash
npm install
npm run dev
```

Open **http://localhost:9002** in your browser.

## 🔌 API Endpoints

- `GET /api/telemetry` - Current telemetry snapshot
- `GET /api/telemetry/stream` - Real-time streaming (SSE)

## 🔗 Real Simulators

### PX4 SITL
```bash
git clone https://github.com/PX4/PX4-Autopilot.git
cd PX4-Autopilot && make px4_sitl gazebo
```

### ArduPilot SITL
```bash
git clone https://github.com/ArduPilot/ardupilot.git
cd ardupilot
./waf configure --board sitl && ./waf copter
sim_vehicle.py -v ArduCopter -L default --console
```

## 📚 Documentation

- `docs/MAVLINK_INTEGRATION.md` - Detailed MAVLink guide
- `docs/QUICKSTART.md` - Quick start guide  
- `docs/blueprint.md` - Original blueprint

## 🚁 Ready to fly? Start with `npm run dev`!
