#!/usr/bin/env python3
"""
Simple test to verify simulator and bridge communication
"""

import time
import socket
from ardupilot_sim import DroneSimulator

# Test direct UDP communication
print("Testing direct UDP communication...")

sender = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
receiver = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
receiver.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
receiver.bind(('127.0.0.1', 14551))  # Listen on different port
receiver.settimeout(2)

test_data = b"Test packet"
sender.sendto(test_data, ('127.0.0.1', 14551))

try:
    data, addr = receiver.recvfrom(1024)
    print(f"✓ Successfully received: {data} from {addr}")
except socket.timeout:
    print("✗ No data received - UDP test failed")

sender.close()
receiver.close()

print("\n" + "="*60)
print("Now starting simulator and bridge...")
print("="*60 + "\n")

# Now run the actual simulator
try:
    sim = DroneSimulator()
    sim.run()
except KeyboardInterrupt:
    print("\nShutdown complete")
