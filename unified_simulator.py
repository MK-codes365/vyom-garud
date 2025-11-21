#!/usr/bin/env python3
"""
Unified MAVLink Simulator Server
Runs both the ArduPilot simulator and the HTTP bridge in one process
"""

import json
import time
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import math

# Global drone state
drone_state = {
    'altitude': 0.0,
    'latitude': 37.4764,
    'longitude': -122.4419,
    'roll': 0.0,
    'pitch': 0.0,
    'yaw': 0.0,
    'vx': 0.0,
    'vy': 0.0,
    'vz': 0.0,
    'battery': 100,
    'heartbeat': False,
    'flightMode': 'DISARMED',
    'speed': 0.0,
}

class SimulatorHTTPHandler(BaseHTTPRequestHandler):
    """HTTP handler for telemetry requests"""
    
    def do_GET(self):
        """Handle GET requests"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Return current drone state in MAVLink format
        response = {
            'success': True,
            'timestamp': int(time.time() * 1000),
            'is_connected': True,
            'telemetry': {
                'altitude': drone_state['altitude'],
                'speed': drone_state['speed'],
                'latitude': drone_state['latitude'],
                'longitude': drone_state['longitude'],
                'battery': drone_state['battery'],
                'roll': drone_state['roll'],
                'pitch': drone_state['pitch'],
                'yaw': drone_state['yaw'],
                'heartbeat': drone_state['heartbeat'],
                'flightMode': drone_state['flightMode'],
            }
        }
        
        self.wfile.write(json.dumps(response).encode())
    
    def log_message(self, format, *args):
        """Suppress logging"""
        return

class FlightSimulator:
    """Simulates realistic drone flight"""
    
    def __init__(self):
        self.start_time = time.time()
        self.flight_state = 'IDLE'  # IDLE, TAKEOFF, FLYING, LANDING
        self.takeoff_time = None
    
    def simulate(self):
        """Update drone state based on flight simulation"""
        elapsed = time.time() - self.start_time
        
        # Auto-sequence: takeoff at 5s, hover, land at 40s, repeat
        if elapsed > 5 and self.flight_state == 'IDLE':
            self.flight_state = 'TAKEOFF'
            drone_state['heartbeat'] = True
            drone_state['flightMode'] = 'GUIDED'
        
        if elapsed > 20 and self.flight_state == 'TAKEOFF':
            self.flight_state = 'FLYING'
            self.takeoff_time = time.time()
        
        if elapsed > 40 and self.flight_state == 'FLYING':
            self.flight_state = 'LANDING'
        
        if elapsed > 50 and self.flight_state == 'LANDING':
            self.flight_state = 'IDLE'
            self.start_time = time.time()
        
        # Update altitude
        if self.flight_state == 'TAKEOFF':
            drone_state['altitude'] = min(15, drone_state['altitude'] + 0.3)
            drone_state['vz'] = 0.3
        
        elif self.flight_state == 'FLYING':
            # Hover at 15m
            drone_state['altitude'] = 15.0 + math.sin(elapsed * 0.1) * 0.2
            drone_state['vz'] = math.cos(elapsed * 0.1) * 0.02
            
            # Move around
            flight_elapsed = time.time() - self.takeoff_time
            drone_state['latitude'] += 0.00001 * math.sin(flight_elapsed * 0.2)
            drone_state['longitude'] += 0.00001 * math.cos(flight_elapsed * 0.2)
            drone_state['vx'] = math.sin(flight_elapsed * 0.2) * 2
            drone_state['vy'] = math.cos(flight_elapsed * 0.2) * 2
            drone_state['speed'] = math.sqrt(drone_state['vx']**2 + drone_state['vy']**2)
            
            # Attitude
            drone_state['roll'] = math.sin(flight_elapsed * 0.1) * 0.2
            drone_state['pitch'] = math.cos(flight_elapsed * 0.1) * 0.2
            drone_state['yaw'] += 0.01
            
            # Battery drain
            drone_state['battery'] = max(20, 100 - flight_elapsed * 1.0)
        
        elif self.flight_state == 'LANDING':
            drone_state['altitude'] = max(0, drone_state['altitude'] - 0.3)
            drone_state['vz'] = -0.3
            if drone_state['altitude'] == 0:
                drone_state['heartbeat'] = False
                drone_state['flightMode'] = 'DISARMED'
        
        elif self.flight_state == 'IDLE':
            drone_state['altitude'] = 0
            drone_state['vx'] = 0
            drone_state['vy'] = 0
            drone_state['vz'] = 0
            drone_state['speed'] = 0
            drone_state['roll'] = 0
            drone_state['pitch'] = 0
            drone_state['battery'] = 100

def run_simulator():
    """Run flight simulator loop"""
    sim = FlightSimulator()
    
    while True:
        sim.simulate()
        time.sleep(0.1)  # 10 Hz update rate

def run_server(port=5000):
    """Run HTTP server"""
    server = HTTPServer(('127.0.0.1', port), SimulatorHTTPHandler)
    print(f"✈️  Unified MAVLink Simulator running on http://127.0.0.1:{port}")
    print("   Simulating drone: takeoff → hover → land → repeat")
    print("   Press Ctrl+C to stop\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Simulator stopped")
        server.shutdown()

if __name__ == '__main__':
    # Start simulator in background thread
    sim_thread = threading.Thread(target=run_simulator, daemon=True)
    sim_thread.start()
    
    # Run HTTP server in main thread
    run_server()
