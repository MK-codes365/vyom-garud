"use client";

import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GeofencePanel } from "./GeofencePanel";

const LoadingFallback = ({ title }: { title: string }) => (
  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
    <CardContent className="p-6 h-64 flex items-center justify-center text-slate-400">
      <div className="text-center">
        <div className="animate-pulse mb-2">Loading {title}...</div>
      </div>
    </CardContent>
  </Card>
);

export function AdvancedSettings() {
  return (
    <div className="space-y-6">
      {/* Safety & Geofence */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4">Safety & Boundaries</h2>
        <Suspense fallback={<LoadingFallback title="Geofence" />}>
          <GeofencePanel />
        </Suspense>
      </div>

      {/* Additional Settings Placeholder */}
      <div>
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4">System Configuration</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-slate-900/50 border border-slate-700">
                <p className="text-sm text-slate-400">🔧 Additional settings coming soon:</p>
                <ul className="text-xs text-slate-500 mt-2 space-y-1 ml-4">
                  <li>✓ PID Tuning Parameters</li>
                  <li>✓ Failsafe Configuration</li>
                  <li>✓ Sensor Calibration</li>
                  <li>✓ Network Settings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
