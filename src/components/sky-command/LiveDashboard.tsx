"use client";

import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TelemetryPanel } from "./TelemetryPanel";
import { FlightPathPanel } from "./FlightPathPanel";
import { LiveTelemetryChart } from "./LiveTelemetryChart";
import { ManualControlPanel } from "./ManualControlPanel";
import { AISuggestionsPanel } from "./AISuggestionsPanel";
import { VideoStreamPanel } from "./VideoStreamPanel";

const LoadingFallback = ({ title }: { title: string }) => (
  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
    <CardContent className="p-6 h-64 flex items-center justify-center text-slate-400">
      <div className="text-center">
        <div className="animate-pulse mb-2">Loading {title}...</div>
      </div>
    </CardContent>
  </Card>
);

export function LiveDashboard() {
  return (
    <div className="space-y-6">
      {/* Telemetry Overview - Always Visible */}
      <div>
        <h2 className="text-xl font-bold text-slate-200 mb-4">Live Telemetry</h2>
        <Suspense fallback={<LoadingFallback title="Telemetry" />}>
          <TelemetryPanel />
        </Suspense>
      </div>

      {/* Main Grid - Video on right, Map/Chart on left */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Column - Maps and Charts (wider) */}
        <div className="col-span-1 flex flex-col gap-6 lg:col-span-3">
          <div>
            <h2 className="text-lg font-bold text-slate-200 mb-4">Flight Path & Monitoring</h2>
            <Suspense fallback={<LoadingFallback title="Map" />}>
              <FlightPathPanel />
            </Suspense>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-200 mb-4">Performance Analytics</h2>
            <Suspense fallback={<LoadingFallback title="Chart" />}>
              <LiveTelemetryChart />
            </Suspense>
          </div>
        </div>

        {/* Right Column - Video and Controls (compact) */}
        <div className="col-span-1 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-200 mb-4">Camera Feeds</h2>
            <Suspense fallback={<LoadingFallback title="Video Stream" />}>
              <VideoStreamPanel />
            </Suspense>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-200 mb-4">Manual Control</h2>
            <Suspense fallback={<LoadingFallback title="Control Panel" />}>
              <ManualControlPanel />
            </Suspense>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-200 mb-4">AI Assistant</h2>
            <Suspense fallback={<LoadingFallback title="AI Assistant" />}>
              <AISuggestionsPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
