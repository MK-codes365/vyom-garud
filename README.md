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

  **--------------------------------------------------------------------------------------------------------------------**
  Images
  1. <img width="1919" height="869" alt="Screenshot 2025-11-22 014102" src="https://github.com/user-attachments/assets/5504c60e-fd99-4a22-8193-1f7e4a357f72" />
  2. <img width="1869" height="706" alt="Screenshot 2025-11-22 014123" src="https://github.com/user-attachments/assets/426bb1da-c94a-43fe-a06b-88ce9626513e" />
  3. <img width="1906" height="827" alt="Screenshot 2025-11-22 014137" src="https://github.com/user-attachments/assets/9d842c3c-09d2-4154-951e-e053597ff82e" />
  4. <img width="1909" height="773" alt="Screenshot 2025-11-22 014147" src="https://github.com/user-attachments/assets/68018e67-7ad3-4336-9bb1-eab7478092a9" />
  5. <img width="1896" height="858" alt="Screenshot 2025-11-22 014158" src="https://github.com/user-attachments/assets/4f46963d-45fc-4beb-801f-dadd9686306d" />






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

Vercel Deployment Live Link : https://vyom-garud-tau-ten.vercel.app/

## 🚁 Ready to fly? Start with `npm run dev`!
