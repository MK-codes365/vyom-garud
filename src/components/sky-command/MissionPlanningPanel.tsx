"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Send, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDroneControl } from "@/context/drone-control-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Waypoint {
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  order: number;
}

export function MissionPlanningPanel() {
  const { toast } = useToast();
  const { mission, addWaypoint, removeWaypoint, uploadMission, clearMission } =
    useDroneControl();
  const [formData, setFormData] = useState({
    latitude: 34.0522,
    longitude: -118.2437,
    altitude: 50,
    speed: 10,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude" 
        ? parseFloat(value) 
        : parseInt(value, 10),
    }));
  };

  const handleAddWaypoint = () => {
    if (formData.latitude === 0 && formData.longitude === 0) {
      toast({
        title: "Invalid Location",
        description: "Please enter valid coordinates",
        variant: "destructive",
      });
      return;
    }

    addWaypoint({
      latitude: formData.latitude,
      longitude: formData.longitude,
      altitude: formData.altitude,
      speed: formData.speed,
    });

    toast({
      title: "Waypoint Added",
      description: `Waypoint ${mission.waypoints.length + 1} added successfully`,
    });

    // Reset form
    setFormData({
      latitude: 34.0522,
      longitude: -118.2437,
      altitude: 50,
      speed: 10,
    });
  };

  const handleRemoveWaypoint = (id: number) => {
    removeWaypoint(id);
    toast({
      title: "Waypoint Removed",
      description: "Waypoint has been deleted",
    });
  };

  const handleUploadMission = () => {
    if (mission.waypoints.length === 0) {
      toast({
        title: "Empty Mission",
        description: "Add waypoints before uploading",
        variant: "destructive",
      });
      return;
    }

    uploadMission();
    toast({
      title: "Mission Uploaded",
      description: `${mission.waypoints.length} waypoints uploaded to drone`,
    });
  };

  const handleClearMission = () => {
    clearMission();
    toast({
      title: "Mission Cleared",
      description: "All waypoints have been removed",
    });
  };

  const totalDistance = mission.waypoints.length > 1
    ? mission.waypoints.reduce((acc, wp, idx) => {
        if (idx === 0) return 0;
        const prev = mission.waypoints[idx - 1];
        const lat1 = (prev.latitude * Math.PI) / 180;
        const lat2 = (wp.latitude * Math.PI) / 180;
        const dLat = ((wp.latitude - prev.latitude) * Math.PI) / 180;
        const dLng = ((wp.longitude - prev.longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return acc + 6371 * c; // Earth radius in km
      }, 0)
    : 0;

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
      <CardHeader className="border-b border-slate-700/30">
        <CardTitle className="text-white">Mission Planning</CardTitle>
        <CardDescription className="text-slate-400">
          Create and manage flight waypoints
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Add Waypoint Form */}
        <div className="space-y-4 mb-6 p-4 rounded-md bg-slate-900/50 border border-slate-700">
          <h3 className="font-semibold text-slate-300">Add Waypoint</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-xs text-slate-400">
                Latitude
              </Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={handleInputChange}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-xs text-slate-400">
                Longitude
              </Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={handleInputChange}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="altitude" className="text-xs text-slate-400">
                Altitude (m)
              </Label>
              <Input
                id="altitude"
                name="altitude"
                type="number"
                value={formData.altitude}
                onChange={handleInputChange}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speed" className="text-xs text-slate-400">
                Speed (m/s)
              </Label>
              <Input
                id="speed"
                name="speed"
                type="number"
                value={formData.speed}
                onChange={handleInputChange}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <Button
            onClick={handleAddWaypoint}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Waypoint
          </Button>
        </div>

        {/* Mission Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-md bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400">Waypoints</p>
            <p className="text-lg font-bold text-blue-400">
              {mission.waypoints.length}
            </p>
          </div>
          <div className="p-3 rounded-md bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400">Distance</p>
            <p className="text-lg font-bold text-cyan-400">
              {totalDistance.toFixed(2)} km
            </p>
          </div>
          <div className="p-3 rounded-md bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400">Status</p>
            <p className={`text-lg font-bold ${mission.isActive ? 'text-green-400' : 'text-slate-400'}`}>
              {mission.isActive ? "Active" : "Idle"}
            </p>
          </div>
        </div>

        {/* Waypoints Table */}
        {mission.waypoints.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-400">Order</TableHead>
                  <TableHead className="text-slate-400">Lat</TableHead>
                  <TableHead className="text-slate-400">Lng</TableHead>
                  <TableHead className="text-slate-400">Alt(m)</TableHead>
                  <TableHead className="text-slate-400">Speed</TableHead>
                  <TableHead className="text-slate-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mission.waypoints.map((wp, idx) => (
                  <TableRow key={wp.id}>
                    <TableCell className="text-slate-300">{idx + 1}</TableCell>
                    <TableCell className="text-slate-300">
                      {wp.latitude.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {wp.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-slate-300">{wp.altitude}</TableCell>
                    <TableCell className="text-slate-300">{wp.speed}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleRemoveWaypoint(wp.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-600/30"
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleUploadMission}
            disabled={mission.waypoints.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            <Send className="mr-2 h-4 w-4" />
            Upload Mission
          </Button>
          <Button
            onClick={handleClearMission}
            disabled={mission.waypoints.length === 0}
            variant="outline"
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 rounded-md bg-blue-900/20 border border-blue-700/50">
          <p className="text-xs text-blue-200">
            💡 Create waypoints by entering coordinates. Upload to send mission to drone.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
