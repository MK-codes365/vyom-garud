"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDroneControl } from "@/context/drone-control-context";

export function ManualControlPanel() {
  const [speed, setSpeed] = useState([50]);
  const [altitude, setAltitude] = useState([75]);
  const { toast } = useToast();
  const { moveDrone, setAltitude: setDroneAltitude } = useDroneControl();
  const [activeControl, setActiveControl] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const executeMovement = (control: string) => {
    const speedMultiplier = speed[0] / 100;
    const distance = 10 * speedMultiplier;
    
    if (control === 'Forward') moveDrone('forward', distance);
    if (control === 'Backward') moveDrone('backward', distance);
    if (control === 'Turn Left') moveDrone('left', distance);
    if (control === 'Turn Right') moveDrone('right', distance);
    if (control === 'Ascend') moveDrone('ascend');
    if (control === 'Descend') moveDrone('descend');
  };

  const handleMouseDown = (control: string) => {
    setActiveControl(control);
    // Execute immediately on press
    executeMovement(control);
    
    // Then repeat every 100ms while held
    intervalRef.current = setInterval(() => {
      executeMovement(control);
    }, 100);
  };

  const handleMouseUp = () => {
    setActiveControl(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Add global mouse up listener
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleAltitudeChange = (value: number[]) => {
    setAltitude(value);
    setDroneAltitude(value[0]);
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
      <CardHeader className="border-b border-slate-700/30">
        <CardTitle className="text-white">Manual Control Override</CardTitle>
        <CardDescription className="text-slate-400">
          Take immediate control of the drone.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-6 pt-6">
        <div className="space-y-4">
          {/* Forward */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="icon" 
              className={`w-12 h-12 bg-slate-700 border-slate-600 hover:bg-blue-600 hover:border-blue-500 transition-all ${activeControl === 'Forward' ? 'bg-blue-600 border-blue-500' : ''}`}
              onMouseDown={() => handleMouseDown('Forward')}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <ArrowUp />
            </Button>
          </div>

          {/* Left, Ascend, Right */}
          <div className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className={`w-12 h-12 bg-slate-700 border-slate-600 hover:bg-blue-600 hover:border-blue-500 transition-all ${activeControl === 'Turn Left' ? 'bg-blue-600 border-blue-500' : ''}`}
              onMouseDown={() => handleMouseDown('Turn Left')}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <ArrowLeft />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className={`w-12 h-12 bg-slate-700 border-slate-600 hover:bg-cyan-600 hover:border-cyan-500 transition-all ${activeControl === 'Ascend' ? 'bg-cyan-600 border-cyan-500' : ''}`}
              onMouseDown={() => handleMouseDown('Ascend')}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <ChevronsUp />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className={`w-12 h-12 bg-slate-700 border-slate-600 hover:bg-blue-600 hover:border-blue-500 transition-all ${activeControl === 'Turn Right' ? 'bg-blue-600 border-blue-500' : ''}`}
              onMouseDown={() => handleMouseDown('Turn Right')}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <ArrowRight />
            </Button>
          </div>
          
          {/* Backward & Descend */}
          <div className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className={`w-12 h-12 bg-slate-700 border-slate-600 hover:bg-blue-600 hover:border-blue-500 transition-all ${activeControl === 'Backward' ? 'bg-blue-600 border-blue-500' : ''}`}
              onMouseDown={() => handleMouseDown('Backward')}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <ArrowDown />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className={`w-12 h-12 bg-slate-700 border-slate-600 hover:bg-cyan-600 hover:border-cyan-500 transition-all ${activeControl === 'Descend' ? 'bg-cyan-600 border-cyan-500' : ''}`}
              onMouseDown={() => handleMouseDown('Descend')}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <ChevronsDown />
            </Button>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="speed-slider" className="text-slate-300">Movement Speed</Label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-400">{speed[0]}%</span>
                <span className="text-xs text-slate-400">({Math.round(10 * speed[0] / 100)}m/cmd)</span>
              </div>
            </div>
            <Slider
              id="speed-slider"
              defaultValue={speed}
              onValueChange={setSpeed}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="altitude-slider" className="text-slate-300">Altitude Target</Label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-cyan-400">{altitude[0]}m</span>
                <span className="text-xs text-slate-400">
                  {altitude[0] < 30 ? '(Low)' : altitude[0] < 80 ? '(Mid)' : '(High)'}
                </span>
              </div>
            </div>
            <Slider
              id="altitude-slider"
              defaultValue={altitude}
              onValueChange={handleAltitudeChange}
              max={150}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Ground</span>
              <span>Cruise</span>
              <span>Max</span>
            </div>
          </div>

          {/* Visual Status */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-md bg-slate-800/50 border border-slate-700">
            <div>
              <p className="text-xs text-slate-400">Movement Distance</p>
              <p className="text-sm font-semibold text-blue-300">{Math.round(10 * speed[0] / 100)}m per command</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Current Altitude</p>
              <p className="text-sm font-semibold text-cyan-300">{altitude[0]}m</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
