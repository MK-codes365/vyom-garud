#!/usr/bin/env python3
"""
Simple ArduPilot-compatible MAVLink Simulator
Generates realistic drone telemetry without needing the full SITL installation
"""

import socket
import struct
import time
import math
from pymavlink.dialects.v20 import ardupilotmega as mavlink_module

def create_mavlink_message(msgid, **kwargs):
    """Create a MAVLink message"""
    msg = mavlink_module.MAVLink_message(msgid)
    for key, value in kwargs.items():
        setattr(msg, key, value)
    return msg

def pack_mavlink_message(msg):
    """Pack MAVLink message to bytes"""
    return msg.pack(mavlink_module.MAVLink(None, 0, 0))

class DroneSimulator:
    def __init__(self, listen_port=14550):
        self.listen_port = listen_port
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind(('127.0.0.1', listen_port))
        self.broadcast_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        
        # Drone state
        self.time_boot_ms = 0
        self.latitude = 374764200  # San Francisco (37.4764° N)
        self.longitude = -1224419600  # (-122.4419° W)
        self.altitude = 0  # meters above home
        self.relative_alt = 0
        self.vx = 0
        self.vy = 0
        self.vz = 0
        self.yaw = 0
        self.roll = 0
        self.pitch = 0
        self.battery_remaining = 100
        self.is_armed = False
        self.mode = 0  # STABILIZE
        self.flight_state = 'IDLE'  # IDLE, TAKEOFF, FLYING, LANDING
        self.takeoff_time = None
        
    def generate_heartbeat(self):
        """Generate HEARTBEAT message (msg_id=0)"""
        msg = mavlink_module.MAVLink_heartbeat_message(
            type=2,  # MAV_TYPE_QUADROTOR
            autopilot=3,  # MAV_AUTOPILOT_ARDUPILOTMEGA
            base_mode=0x89,  # guided mode with armed flag
            custom_mode=0,
            system_status=3,  # MAV_STATE_ACTIVE
            mavlink_version=3
        )
        return pack_mavlink_message(msg)
    
    def generate_system_time(self):
        """Generate SYSTEM_TIME message (msg_id=1)"""
        msg = mavlink_module.MAVLink_system_time_message(
            time_unix_usec=int(time.time() * 1e6),
            time_boot_ms=self.time_boot_ms
        )
        return pack_mavlink_message(msg)
    
    def generate_attitude(self):
        """Generate ATTITUDE message (msg_id=30)"""
        msg = mavlink_module.MAVLink_attitude_message(
            time_boot_ms=self.time_boot_ms,
            roll=self.roll,
            pitch=self.pitch,
            yaw=self.yaw,
            rollspeed=0.01,
            pitchspeed=0.01,
            yawspeed=0.02
        )
        return pack_mavlink_message(msg)
    
    def generate_global_position(self):
        """Generate GLOBAL_POSITION_INT message (msg_id=33)"""
        msg = mavlink_module.MAVLink_global_position_int_message(
            time_boot_ms=self.time_boot_ms,
            lat=self.latitude,
            lon=self.longitude,
            alt=int(self.altitude * 1000),
            relative_alt=int(self.relative_alt * 1000),
            vx=int(self.vx * 100),
            vy=int(self.vy * 100),
            vz=int(self.vz * 100),
            hdg=int(math.degrees(self.yaw) * 100)
        )
        return pack_mavlink_message(msg)
    
    def generate_battery_status(self):
        """Generate BATTERY_STATUS message (msg_id=147)"""
        msg = mavlink_module.MAVLink_battery_status_message(
            id=0,
            battery_function=0,
            type=2,  # LIPO
            temperature=4200,
            voltages=[11850, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            current_battery=2000,
            current_consumed=-1,
            energy_consumed=-1,
            battery_remaining=int(self.battery_remaining)
        )
        return pack_mavlink_message(msg)
    
    def simulate_flight(self):
        """Simulate drone flight behavior"""
        if self.flight_state == 'TAKEOFF':
            if self.altitude < 10:
                self.altitude += 0.1
                self.relative_alt = self.altitude
            else:
                self.flight_state = 'FLYING'
                self.takeoff_time = time.time()
        
        elif self.flight_state == 'FLYING':
            # Simulate forward movement
            elapsed = time.time() - self.takeoff_time
            self.latitude += int(elapsed * 0.0001)
            self.longitude += int(elapsed * 0.0001)
            self.vx = 3.0  # m/s forward
            self.vy = 1.0
            self.yaw += 0.01
            
            # Battery drain
            self.battery_remaining = max(20, 100 - elapsed * 0.5)
        
        elif self.flight_state == 'LANDING':
            if self.altitude > 0.1:
                self.altitude -= 0.15
                self.relative_alt = self.altitude
                self.vz = -0.5
            else:
                self.flight_state = 'IDLE'
                self.altitude = 0
                self.relative_alt = 0
                self.vx = 0
                self.vy = 0
                self.vz = 0
                self.is_armed = False
    
    def run(self):
        """Main simulator loop"""
        print(f"🚁 ArduPilot Simulator listening on UDP 127.0.0.1:{self.listen_port}")
        print("   Simulating realistic drone telemetry...")
        print("   Press Ctrl+C to stop\n")
        
        start_time = time.time()
        
        try:
            while True:
                self.time_boot_ms = int((time.time() - start_time) * 1000)
                
                # Auto-simulate: takeoff at 5s, hover at 20s, land at 40s
                elapsed = time.time() - start_time
                if elapsed > 5 and self.flight_state == 'IDLE':
                    self.is_armed = True
                    self.flight_state = 'TAKEOFF'
                
                if elapsed > 40 and self.flight_state == 'FLYING':
                    self.flight_state = 'LANDING'
                
                # Update flight dynamics
                self.simulate_flight()
                
                # Send MAVLink messages
                messages = [
                    self.generate_heartbeat(),
                    self.generate_system_time(),
                    self.generate_attitude(),
                    self.generate_global_position(),
                    self.generate_battery_status(),
                ]
                
                for msg in messages:
                    try:
                        # Send to bridge listening on 14550
                        self.broadcast_socket.sendto(msg, ('127.0.0.1', self.listen_port))
                    except:
                        pass
                
                # Print status
                if int(elapsed) % 5 == 0 and self.time_boot_ms % 5000 < 100:
                    status = "ARMED" if self.is_armed else "DISARMED"
                    print(f"[{elapsed:.1f}s] {status} | Alt: {self.altitude:.1f}m | Bat: {self.battery_remaining:.0f}% | State: {self.flight_state}")
                
                time.sleep(0.1)  # 10 Hz update rate
        
        except KeyboardInterrupt:
            print("\n✓ Simulator stopped")

if __name__ == '__main__':
    sim = DroneSimulator()
    sim.run()
