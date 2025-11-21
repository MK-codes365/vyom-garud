"use client";
import {
  ArrowDownUp,
  Gauge,
  Activity,
  Layers,
} from "lucide-react";
import { useDroneData } from "@/hooks/use-drone-data";
import { useDroneControl } from "@/context/drone-control-context";
import { TelemetryCard } from "./TelemetryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AttitudeIndicator = ({ roll, pitch, yaw }: { roll: number; pitch: number; yaw: number }) => {
  return (
    <div className="relative h-24 w-24 rounded-full bg-blue-200 overflow-hidden border-2 border-foreground/50 mx-auto">
      <div 
        className="absolute w-full h-full bg-orange-800/80"
        style={{ transform: `translateY(${-pitch}px) rotate(${-roll}deg)` }}
      >
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-0.5 bg-foreground"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-0.5 bg-foreground"></div>
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-8 border-t-primary transition-transform duration-500"
        style={{ transform: `rotate(${yaw}deg) translateY(4px)` }}
      />
    </div>
  );
};


export function TelemetryPanel() {
  const { telemetry, isConnected } = useDroneData();
  const { flightMode } = useDroneControl();

  if (!isConnected) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-16 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <TelemetryCard
        title="Altitude"
        value={telemetry.altitude.toFixed(1)}
        unit="m"
        icon={ArrowDownUp}
      />
      <TelemetryCard
        title="Speed"
        value={telemetry.speed.toFixed(1)}
        unit="m/s"
        icon={Gauge}
      />
      <TelemetryCard
        title="Heartbeat"
        value={telemetry.heartbeat ? 'OK' : 'LOST'}
        icon={Activity}
      />
      <TelemetryCard
        title="Flight Mode"
        value={flightMode}
        icon={Layers}
      />
    </div>
  );
}
