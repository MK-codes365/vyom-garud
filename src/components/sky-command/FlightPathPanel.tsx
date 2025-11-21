"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDroneData } from "@/hooks/use-drone-data";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  loading: () => (
    <div className="w-full h-96 bg-slate-900 flex items-center justify-center text-slate-400">
      Loading map...
    </div>
  ),
  ssr: false,
});

export function FlightPathPanel() {
  const { telemetry } = useDroneData();
  const [dronePosition, setDronePosition] = useState({
    lat: telemetry.latitude,
    lng: telemetry.longitude,
    alt: telemetry.altitude,
  });

  useEffect(() => {
    setDronePosition({
      lat: telemetry.latitude,
      lng: telemetry.longitude,
      alt: telemetry.altitude,
    });
  }, [telemetry.latitude, telemetry.longitude, telemetry.altitude]);

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-blue-500/30 transition-all duration-300">
      <CardHeader className="border-b border-slate-700/30">
        <CardTitle className="text-white">Live Map View</CardTitle>
        <CardDescription className="text-slate-400">
          Real-time drone position and flight path
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full h-96 bg-slate-900/50">
          <ErrorBoundary componentName="Map">
            <MapComponent
              dronePosition={dronePosition}
              latitude={telemetry.latitude}
              longitude={telemetry.longitude}
              altitude={telemetry.altitude}
            />
          </ErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
}
