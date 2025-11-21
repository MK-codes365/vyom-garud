"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Power, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDroneControl } from "@/context/drone-control-context";

export function ImmediateControlPanel() {
  const { toast } = useToast();
  const { isArmed, arm, disarm, returnToHome, emergencyStop } = useDroneControl();
  const [isLoading, setIsLoading] = useState(false);

  const handleArm = async () => {
    setIsLoading(true);
    try {
      arm();
      toast({
        title: "Drone Armed",
        description: "Drone is ready for flight",
      });
    } catch (error) {
      toast({
        title: "Arm Failed",
        description: "Could not arm the drone",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisarm = async () => {
    setIsLoading(true);
    try {
      disarm();
      toast({
        title: "Drone Disarmed",
        description: "Drone is now safe",
      });
    } catch (error) {
      toast({
        title: "Disarm Failed",
        description: "Could not disarm the drone",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRTH = async () => {
    setIsLoading(true);
    try {
      returnToHome();
      toast({
        title: "Return to Home",
        description: "Drone is returning to home position",
      });
    } catch (error) {
      toast({
        title: "RTH Failed",
        description: "Could not initiate return to home",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyStop = async () => {
    setIsLoading(true);
    try {
      emergencyStop();
      toast({
        title: "Emergency Stop Activated",
        description: "Drone has been emergency stopped",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Emergency Stop Failed",
        description: "Could not execute emergency stop",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
      <CardHeader className="border-b border-slate-700/30">
        <CardTitle className="text-white">Immediate Control</CardTitle>
        <CardDescription className="text-slate-400">
          Critical drone operations
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Arm/Disarm */}
          <div className="col-span-2">
            {!isArmed ? (
              <Button
                onClick={handleArm}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg transition-all"
              >
                <Power className="mr-2 h-5 w-5" />
                ARM DRONE
              </Button>
            ) : (
              <Button
                onClick={handleDisarm}
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6 text-lg transition-all"
              >
                <Power className="mr-2 h-5 w-5" />
                DISARM DRONE
              </Button>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="p-3 rounded-md bg-slate-900/50 border border-slate-700 mb-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isArmed ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></div>
            <p className="text-sm font-semibold text-slate-300">
              Status: <span className={isArmed ? "text-green-400" : "text-red-400"}>
                {isArmed ? "ARMED" : "DISARMED"}
              </span>
            </p>
          </div>
        </div>

        {/* RTH Button */}
        <Button
          onClick={handleRTH}
          disabled={isLoading || !isArmed}
          className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 transition-all"
        >
          <Home className="mr-2 h-5 w-5" />
          Return to Home
        </Button>

        {/* Emergency Stop */}
        <Button
          onClick={handleEmergencyStop}
          disabled={isLoading}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-4 transition-all"
        >
          <AlertCircle className="mr-2 h-5 w-5" />
          Emergency Stop
        </Button>

        {/* Info */}
        <div className="mt-6 p-3 rounded-md bg-amber-900/20 border border-amber-700/50">
          <p className="text-xs text-amber-200">
            ⚠️ ARM before flying. Use RTH to return safely. Emergency Stop is irreversible.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
