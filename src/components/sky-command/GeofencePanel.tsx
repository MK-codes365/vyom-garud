"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GitCommit, PlusCircle, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDroneControl } from "@/context/drone-control-context";
import { Badge } from "../ui/badge";
import { useState, useEffect } from "react";

export function GeofencePanel() {
  const { geofences, toggleGeofence, removeGeofence, droneOffset, isInsideGeofence } = useDroneControl();
  const [isBreach, setIsBreach] = useState(false);

  // Check for breach when drone position changes
  useEffect(() => {
    const activeGeofences = geofences.filter(g => g.active);
    if (activeGeofences.length > 0) {
      const breached = !isInsideGeofence(droneOffset.lat, droneOffset.lng);
      setIsBreach(breached);
    }
  }, [droneOffset, geofences, isInsideGeofence]);

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
      <CardHeader className="border-b border-slate-700/30">
        <CardTitle className="text-white">Geofencing</CardTitle>
        <CardDescription className="text-slate-400">
          Virtual boundaries for the drone - {geofences.filter(g => g.active).length} active
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {isBreach && geofences.some(g => g.active) && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Geofence Breach!</AlertTitle>
            <AlertDescription>
              Drone position is outside the permitted area. Movement restricted.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {geofences.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No geofences defined</p>
          ) : (
            geofences.map((fence) => (
              <div
                key={fence.id}
                className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800/50 p-3 hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Switch
                    checked={fence.active}
                    onCheckedChange={() => toggleGeofence(fence.id)}
                    className="scale-75"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{fence.name}</p>
                    <p className="text-xs text-slate-400">
                      Radius: {fence.radius}m
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={fence.active ? "default" : "secondary"} 
                    className={fence.active ? "bg-cyan-600 hover:bg-cyan-700" : "bg-slate-700 text-slate-300"}
                  >
                    {fence.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeGeofence(fence.id)}
                    className="h-6 w-6 p-0 hover:bg-red-900/50 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-slate-700/30 pt-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-slate-700 border-slate-600 hover:bg-blue-600 hover:border-blue-500 text-slate-200"
          disabled
          title="Geofence editing coming soon"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Geofence
        </Button>
      </CardFooter>
    </Card>
  );
}
