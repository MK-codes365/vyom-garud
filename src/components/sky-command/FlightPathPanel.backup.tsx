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

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  loading: () => <div className="w-full h-96 bg-slate-900 flex items-center justify-center text-slate-400">Loading map...</div>,
  ssr: false
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
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Live Map View</CardTitle>
        <CardDescription>
          Real-time drone position and flight path tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full h-96">
          <MapComponent 
            dronePosition={dronePosition}
            latitude={telemetry.latitude}
            longitude={telemetry.longitude}
            altitude={telemetry.altitude}
          />
        </div>
      </CardContent>
    </Card>
  );
}
