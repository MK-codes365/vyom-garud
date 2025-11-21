# MAVLink Integration - Usage Examples

## 🎯 Common Use Cases

### 1. Display Real-Time Telemetry

```javascript
// In a React component
import { useDroneData } from '@/hooks/use-drone-data';

export function TelemetryDisplay() {
  const { telemetry, isConnected } = useDroneData();

  return (
    <div>
      <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <p>Altitude: {telemetry.altitude.toFixed(1)} m</p>
      <p>Speed: {telemetry.speed.toFixed(1)} m/s</p>
      <p>Battery: {telemetry.battery.toFixed(0)} %</p>
      <p>Flight Mode: {telemetry.flightMode}</p>
      <p>Position: {telemetry.latitude.toFixed(4)}, {telemetry.longitude.toFixed(4)}</p>
    </div>
  );
}
```

### 2. Create Custom Charts

```javascript
import { useDroneData } from '@/hooks/use-drone-data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

export function AltitudeChart() {
  const { telemetryHistory } = useDroneData();

  return (
    <LineChart data={telemetryHistory}>
      <CartesianGrid />
      <XAxis dataKey="time" />
      <YAxis />
      <Line 
        type="monotone" 
        dataKey="altitude" 
        stroke="#8884d8" 
        dot={false}
        animationDuration={0}
      />
    </LineChart>
  );
}
```

### 3. Monitor Battery Level

```javascript
import { useDroneData } from '@/hooks/use-drone-data';

export function BatteryMonitor() {
  const { telemetry } = useDroneData();
  
  const batteryPercent = telemetry.battery;
  const isCritical = batteryPercent < 20;
  const isLow = batteryPercent < 50;

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: isCritical ? '#ef4444' : isLow ? '#eab308' : '#22c55e',
      color: 'white',
      borderRadius: '0.5rem'
    }}>
      <p>🔋 Battery: {batteryPercent.toFixed(0)}%</p>
      {isCritical && <p>⚠️ Critical battery level!</p>}
      {isLow && !isCritical && <p>⚠️ Low battery</p>}
    </div>
  );
}
```

### 4. Track GPS Position on Map

```javascript
import { useDroneData } from '@/hooks/use-drone-data';

export function MapView() {
  const { telemetry } = useDroneData();

  // Could integrate with Leaflet, Mapbox, or Google Maps
  return (
    <div>
      <p>Latitude: {telemetry.latitude.toFixed(5)}°</p>
      <p>Longitude: {telemetry.longitude.toFixed(5)}°</p>
      <p>Altitude: {telemetry.altitude.toFixed(1)} m</p>
      {/* Render map here */}
    </div>
  );
}
```

### 5. Connection Status Indicator

```javascript
import { useDroneData } from '@/hooks/use-drone-data';

export function ConnectionStatus() {
  const { isConnected } = useDroneData();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      backgroundColor: isConnected ? '#dcfce7' : '#fee2e2',
      borderRadius: '0.25rem',
      border: `2px solid ${isConnected ? '#22c55e' : '#ef4444'}`
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: isConnected ? '#22c55e' : '#ef4444',
        animation: isConnected ? 'none' : 'pulse 2s infinite'
      }} />
      <span>{isConnected ? 'Connected to Drone' : 'Disconnected'}</span>
    </div>
  );
}
```

### 6. Fetch Telemetry via REST API

```javascript
// Without using the hook (manual fetch)
async function getTelemetry() {
  const response = await fetch('/api/telemetry');
  const data = await response.json();
  
  if (data.success) {
    console.log('Altitude:', data.telemetry.altitude);
    console.log('Speed:', data.telemetry.speed);
    console.log('MAVLink Messages:', data.mavlink_messages);
  }
}

getTelemetry();
```

### 7. Stream Telemetry via Server-Sent Events

```javascript
// Manual SSE connection (hook does this automatically)
const eventSource = new EventSource('/api/telemetry/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'telemetry') {
    console.log('New telemetry:', data.telemetry);
    console.log('Received at:', data.timestamp);
  } else if (data.type === 'connected') {
    console.log('Connected to stream');
  }
};

eventSource.onerror = () => {
  console.error('Stream error, falling back to polling');
  eventSource.close();
};
```

### 8. Custom Flight Mode Handler

```javascript
import { useDroneData } from '@/hooks/use-drone-data';

export function FlightModeDisplay() {
  const { telemetry } = useDroneData();
  
  const flightModeConfig: Record<string, { color: string; icon: string }> = {
    'STABILIZE': { color: 'blue', icon: '🛡️' },
    'ACRO': { color: 'purple', icon: '🎪' },
    'ALT_HOLD': { color: 'green', icon: '📏' },
    'AUTO': { color: 'red', icon: '🤖' },
    'GUIDED': { color: 'orange', icon: '👆' },
    'LOITER': { color: 'cyan', icon: '⭕' },
    'RTL': { color: 'yellow', icon: '🏠' },
    'LAND': { color: 'red', icon: '⬇️' },
  };
  
  const config = flightModeConfig[telemetry.flightMode] || { 
    color: 'gray', 
    icon: '❓' 
  };

  return (
    <div style={{ color: config.color }}>
      <p>{config.icon} {telemetry.flightMode}</p>
    </div>
  );
}
```

### 9. Attitude Visualization (Roll/Pitch/Yaw)

```javascript
import { useDroneData } from '@/hooks/use-drone-data';

export function AttitudeIndicator() {
  const { telemetry } = useDroneData();
  
  // Convert radians to degrees
  const rollDeg = (telemetry.roll * 180) / Math.PI;
  const pitchDeg = (telemetry.pitch * 180) / Math.PI;
  const yawDeg = (telemetry.yaw * 180) / Math.PI;

  return (
    <div>
      <p>Roll: {rollDeg.toFixed(1)}°</p>
      <p>Pitch: {pitchDeg.toFixed(1)}°</p>
      <p>Yaw: {yawDeg.toFixed(1)}°</p>
      
      {/* Horizon-like visualization */}
      <div style={{
        width: '200px',
        height: '200px',
        border: '2px solid black',
        borderRadius: '50%',
        overflow: 'hidden',
        transform: `rotate(${yawDeg}deg)`
      }}>
        <div style={{
          width: '100%',
          height: '50%',
          backgroundColor: '#87CEEB', // sky blue
          transform: `skewX(${rollDeg}deg) translateY(${pitchDeg}px)`
        }} />
        <div style={{
          width: '100%',
          height: '50%',
          backgroundColor: '#8B7355', // brown
        }} />
      </div>
    </div>
  );
}
```

### 10. Telemetry Alert System

```javascript
import { useDroneData } from '@/hooks/use-drone-data';

export function TelemetryAlerts() {
  const { telemetry } = useDroneData();
  const alerts: string[] = [];

  // Battery alerts
  if (telemetry.battery < 10) {
    alerts.push('🚨 Critical: Battery < 10%');
  } else if (telemetry.battery < 20) {
    alerts.push('⚠️ Warning: Battery < 20%');
  }

  // Altitude alerts
  if (telemetry.altitude > 500) {
    alerts.push('⚠️ Warning: High altitude > 500m');
  }
  if (telemetry.altitude < 5 && telemetry.heartbeat) {
    alerts.push('⚠️ Warning: Low altitude < 5m');
  }

  // Speed alerts
  if (telemetry.speed > 30) {
    alerts.push('⚠️ Warning: High speed > 30 m/s');
  }

  // GPS alerts
  if (!telemetry.heartbeat) {
    alerts.push('🔴 Error: No heartbeat signal');
  }

  return (
    <div>
      {alerts.length === 0 ? (
        <p>✅ All systems normal</p>
      ) : (
        <ul>
          {alerts.map((alert, i) => (
            <li key={i}>{alert}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 🔄 Parsing Custom MAVLink Messages

If you need to parse a custom MAVLink message type:

```typescript
// In src/lib/mavlink-parser.ts

export function parseMAVLinkMessage(data: unknown): Partial<TelemetryFromMAVLink> {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const msg = data as Record<string, any>;
  const telemetry: Partial<TelemetryFromMAVLink> = {};

  // Add your custom message here
  if (msg.msgid === 200 || msg.type === 'CUSTOM_MESSAGE') {
    telemetry.customField = parseFloat(msg.value);
  }

  return telemetry;
}
```

## 🛠️ Extend Telemetry Types

Add new fields to telemetry object:

```typescript
// In src/lib/types.ts

export interface TelemetryData {
  // ... existing fields
  windSpeed?: number;      // m/s
  windDirection?: number;  // degrees
  temperatureOat?: number; // °C (Outside Air Temperature)
  verticalSpeed?: number;  // m/s
}
```

## 📊 Log Telemetry to File

```javascript
import { useDroneData } from '@/hooks/use-drone-data';
import { useEffect } from 'react';

export function TelemetryLogger() {
  const { telemetry } = useDroneData();
  
  useEffect(() => {
    // Log to browser console with timestamp
    console.table({
      timestamp: new Date().toISOString(),
      altitude: telemetry.altitude,
      speed: telemetry.speed,
      battery: telemetry.battery,
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
    });
  }, [telemetry]);

  return null; // No UI component needed
}
```

---

These examples cover the most common use cases for integrating MAVLink telemetry into your dashboard. For more advanced scenarios, refer to the main documentation.
