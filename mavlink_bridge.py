#!/usr/bin/env python3
"""
MAVLink Bridge Server
Connects to drone simulator (PX4 SITL or ArduPilot) and relays messages to the dashboard.

Usage:
    python3 mavlink_bridge.py --host 127.0.0.1 --port 14540

Requirements:
    pip install pymavlink
"""

import argparse
import json
import socket
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
from pymavlink import mavutil
from datetime import datetime

# Global state
current_telemetry = {}
mavlink_messages = []
is_connected = False
connection = None

class MAVLinkBridgeHandler(BaseHTTPRequestHandler):
    """HTTP handler for telemetry requests"""
    
    def do_GET(self):
        global current_telemetry, mavlink_messages, is_connected
        
        parsed_path = urlparse(self.path)
        
        # Enable CORS
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'success': True,
            'timestamp': int(time.time() * 1000),
            'is_connected': is_connected,
            'mavlink_messages': mavlink_messages[-10:],  # Last 10 messages
            'telemetry': current_telemetry,
        }
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

def parse_mavlink_messages(connection):
    """Read and parse MAVLink messages from simulator"""
    global current_telemetry, mavlink_messages, is_connected
    
    while True:
        try:
            msg = connection.recv_msg()
            if msg is None:
                time.sleep(0.01)
                continue
            
            # Record message
            msg_dict = msg.to_dict()
            mavlink_messages.append(msg_dict)
            if len(mavlink_messages) > 100:
                mavlink_messages.pop(0)
            
            is_connected = True
            
            # Parse common messages
            if msg.get_type() == 'GLOBAL_POSITION_INT':
                current_telemetry.update({
                    'latitude': msg.lat / 1e7,
                    'longitude': msg.lon / 1e7,
                    'altitude': msg.alt / 1000,  # mm to m
                    'relative_alt': msg.relative_alt / 1000,
                    'vx': msg.vx / 100,  # cm/s to m/s
                    'vy': msg.vy / 100,
                    'vz': msg.vz / 100,
                    'hdg': msg.hdg / 100,  # deg*100 to deg
                })
                # Calculate speed
                speed = (msg.vx**2 + msg.vy**2)**0.5 / 100
                current_telemetry['speed'] = speed
            
            elif msg.get_type() == 'ATTITUDE':
                current_telemetry.update({
                    'roll': msg.roll,
                    'pitch': msg.pitch,
                    'yaw': msg.yaw,
                })
            
            elif msg.get_type() == 'HEARTBEAT':
                current_telemetry.update({
                    'heartbeat': msg.system_status != 0,
                    'flight_mode': msg.custom_mode,
                    'autopilot': msg.autopilot,
                })
            
            elif msg.get_type() == 'BATTERY_STATUS':
                current_telemetry['battery'] = msg.battery_remaining
            
            elif msg.get_type() == 'GPS_RAW_INT':
                current_telemetry.update({
                    'satellites': msg.satellites_visible,
                    'fix_type': msg.fix_type,
                })
            
            elif msg.get_type() == 'VFR_HUD':
                current_telemetry.update({
                    'airspeed': msg.airspeed,
                    'groundspeed': msg.groundspeed,
                    'heading': msg.heading,
                    'throttle': msg.throttle,
                    'altitude': msg.alt,
                    'climb_rate': msg.climb,
                })
            
            elif msg.get_type() == 'SYSTEM_STATUS':
                current_telemetry['battery'] = msg.battery_remaining
                current_telemetry['load'] = msg.load
            
        except Exception as e:
            print(f"Error reading MAVLink message: {e}")
            is_connected = False
            time.sleep(0.1)

def connect_to_simulator(host, port):
    """Connect to MAVLink simulator"""
    global connection, is_connected
    
    print(f"Connecting to simulator at {host}:{port}...")
    
    while True:
        try:
            connection = mavutil.mavlink_connection(f'udpin:{host}:{port}')
            connection.wait_heartbeat()
            print("✓ Connected to simulator!")
            is_connected = True
            
            # Start message parsing thread
            msg_thread = threading.Thread(
                target=parse_mavlink_messages,
                args=(connection,),
                daemon=True
            )
            msg_thread.start()
            
            break
        except Exception as e:
            print(f"Connection failed: {e}")
            is_connected = False
            time.sleep(2)

def run_server(bridge_host, bridge_port, simulator_host, simulator_port):
    """Run the HTTP bridge server"""
    
    # Connect to simulator in background
    sim_thread = threading.Thread(
        target=connect_to_simulator,
        args=(simulator_host, simulator_port),
        daemon=True
    )
    sim_thread.start()
    
    # Start HTTP server
    server = HTTPServer((bridge_host, bridge_port), MAVLinkBridgeHandler)
    print(f"MAVLink Bridge running on http://{bridge_host}:{bridge_port}")
    print(f"Waiting for simulator at {simulator_host}:{simulator_port}")
    print("Press Ctrl+C to stop\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\nShutting down...")
        server.shutdown()

def main():
    parser = argparse.ArgumentParser(
        description='MAVLink Bridge Server for drone simulator'
    )
    parser.add_argument(
        '--sim-host',
        default='127.0.0.1',
        help='Simulator host (default: 127.0.0.1)'
    )
    parser.add_argument(
        '--sim-port',
        type=int,
        default=14540,
        help='Simulator port - use 14540 for PX4, 14550 for ArduPilot (default: 14540)'
    )
    parser.add_argument(
        '--bridge-host',
        default='127.0.0.1',
        help='Bridge server host (default: 127.0.0.1)'
    )
    parser.add_argument(
        '--bridge-port',
        type=int,
        default=5000,
        help='Bridge server port (default: 5000)'
    )
    
    args = parser.parse_args()
    
    run_server(
        args.bridge_host,
        args.bridge_port,
        args.sim_host,
        args.sim_port
    )

if __name__ == '__main__':
    main()
