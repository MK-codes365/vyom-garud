"use client";

import type { TelemetryData } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';

const initialData: TelemetryData = {
  altitude: 100,
  speed: 0,
  latitude: 34.0522,
  longitude: -118.2437,
  battery: 85,
  roll: 0,
  pitch: 0,
  yaw: 0,
  heartbeat: false,
  flightMode: 'DISCONNECTED',
};

type TelemetryHistoryPoint = {
  time: string;
  altitude: number;
  speed: number;
};

const MAX_HISTORY_LENGTH = 30;

export function useDroneData() {
  const [telemetry, setTelemetry] = useState<TelemetryData>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryHistoryPoint[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket/SSE connection with auto-reconnect
  useEffect(() => {
    let isSubscribed = true;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connectWebSocket = () => {
      if (!isSubscribed) return;

      try {
        // Use SSE (Server-Sent Events) for real-time streaming
        const eventSource = new EventSource('/api/telemetry/websocket');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          if (isSubscribed) {
            setIsConnected(true);
            reconnectAttempts = 0;
            console.log('✓ Connected to telemetry stream');
          }
        };

        eventSource.onmessage = (event) => {
          if (!isSubscribed) return;

          try {
            const data = JSON.parse(event.data);

            if (data.type === 'telemetry' && data.telemetry) {
              const now = new Date();
              const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

              // Update telemetry
              const telemetryData = data.telemetry;
              setTelemetry(telemetryData);

              // Update history separately
              setTelemetryHistory((hist) => {
                const newHist = [
                  ...hist,
                  {
                    time: timeStr,
                    altitude: telemetryData.altitude,
                    speed: telemetryData.speed,
                  },
                ];
                return newHist.slice(-MAX_HISTORY_LENGTH);
              });
            }
          } catch (error) {
            console.error('Error parsing telemetry:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('Stream error:', error);
          if (isSubscribed) {
            setIsConnected(false);
            eventSource.close();
            
            // Attempt reconnection with exponential backoff
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
              console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
              setTimeout(connectWebSocket, delay);
            } else {
              console.error('Max reconnection attempts reached, falling back to polling');
              startPolling();
            }
          }
        };
      } catch (error) {
        console.error('Failed to create EventSource:', error);
        if (isSubscribed) {
          startPolling();
        }
      }
    };

    // Polling fallback
    const startPolling = () => {
      if (!isSubscribed || pollingIntervalRef.current) return;

      pollingIntervalRef.current = setInterval(async () => {
        if (!isSubscribed) return;

        try {
          const response = await fetch('/api/telemetry');
          const data = await response.json();

          if (data.success && data.telemetry) {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

            setTelemetry((prevData) => {
              const updated = { ...prevData, ...data.telemetry };

              setTelemetryHistory((hist) => {
                const newHist = [
                  ...hist,
                  {
                    time: timeStr,
                    altitude: updated.altitude,
                    speed: updated.speed,
                  },
                ];
                return newHist.slice(-MAX_HISTORY_LENGTH);
              });

              return updated;
            });

            setIsConnected(true);
          }
        } catch (error) {
          console.error('Polling error:', error);
          setIsConnected(false);
        }
      }, 100);
    };

    connectWebSocket();

    return () => {
      isSubscribed = false;
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return { telemetry, isConnected, telemetryHistory };
}
