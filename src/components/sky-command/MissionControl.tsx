"use client";

import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MissionPlanningPanel } from "./MissionPlanningPanel";
import { ImmediateControlPanel } from "./ImmediateControlPanel";

const LoadingFallback = ({ title }: { title: string }) => (
  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
    <CardContent className="p-6 h-64 flex items-center justify-center text-slate-400">
      <div className="text-center">
        <div className="animate-pulse mb-2">Loading {title}...</div>
      </div>
    </CardContent>
  </Card>
);

export function MissionControl() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Mission Planning */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4">Mission Planning</h2>
        <Suspense fallback={<LoadingFallback title="Mission Planning" />}>
          <MissionPlanningPanel />
        </Suspense>
      </div>

      {/* Immediate Control */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4">Immediate Control</h2>
        <Suspense fallback={<LoadingFallback title="Immediate Control" />}>
          <ImmediateControlPanel />
        </Suspense>
      </div>
    </div>
  );
}
