/**
 * WebSocket Handler for MAVLink Real-Time Streaming
 * This provides real-time telemetry updates to the dashboard
 */

import type { NextRequest } from 'next/server';
import { generateMAVLinkMessages } from '../../mavlink-simulator';
import { parseMAVLinkMessage } from '@/lib/mavlink-parser';

export const dynamic = 'force-dynamic';

let clients: Set<ReadableStreamDefaultController> = new Set();

export async function GET(request: NextRequest) {
  // Check if client supports streaming
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  let streamActive = true;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

      // Set up interval to send telemetry updates
      const interval = setInterval(() => {
        if (!streamActive) {
          clearInterval(interval);
          controller.close();
          return;
        }

        try {
          const mavlinkMessages = generateMAVLinkMessages();
          let telemetry: Record<string, any> = {};

          for (const msg of mavlinkMessages) {
            const parsed = parseMAVLinkMessage(msg);
            telemetry = { ...telemetry, ...parsed };
          }

          const data = {
            type: 'telemetry',
            timestamp: Date.now(),
            mavlink_messages: mavlinkMessages,
            telemetry: telemetry,
          };

          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
          console.error('Error generating telemetry:', error);
          const errorData = {
            type: 'error',
            message: 'Failed to generate telemetry',
            timestamp: Date.now(),
          };
          controller.enqueue(`data: ${JSON.stringify(errorData)}\n\n`);
        }
      }, 100); // Send updates every 100ms (10 Hz)

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        streamActive = false;
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, { headers });
}
