"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Wind } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { getFlightSuggestions } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data to be sent to the AI model
const mockTelemetryData = JSON.stringify({
  altitude: 115.3,
  speed: 22.8,
  battery: 78.4,
  location: { lat: 34.053, lng: -118.2445 },
  signalStrength: "Strong",
});

const mockWeatherData = JSON.stringify({
  temperature: "24°C",
  wind: "15 km/h from SW",
  precipitation: "10% chance",
  visibility: "10 km",
});

export function AISuggestionsPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResult(null);
    // AI has been removed; call will return a failure object. Show toast.
    const response = await getFlightSuggestions({ telemetryData: mockTelemetryData, weatherData: mockWeatherData });
    setIsLoading(false);

    if (response.success && response.data) {
      setResult(response.data);
      toast({ title: "Analysis Complete", description: "AI has provided flight suggestions." });
    } else {
      toast({ variant: "destructive", title: "AI Disabled", description: response.error || 'AI is unavailable.' });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
      <CardHeader className="border-b border-slate-700/30">
        <CardTitle className="flex items-center gap-2 text-white">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-lg">
            <Image 
              src="/ai.jpg" 
              alt="AI Assistant" 
              width={24} 
              height={24}
              className="h-6 w-6 rounded"
            />
          </div>
          AI Assistant
        </CardTitle>
        <CardDescription className="text-slate-400">
          Get AI-powered adjustments for your flight plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {isLoading && (
            <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 bg-slate-700" />
                <Skeleton className="h-16 w-full bg-slate-700" />
                <Skeleton className="h-8 w-1/2 bg-slate-700" />
                <Skeleton className="h-12 w-full bg-slate-700" />
            </div>
        )}
        {result && (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2 text-slate-200"><Sparkles className="h-4 w-4 text-yellow-400" />Suggested Adjustments</h4>
              <p className="text-slate-300 bg-slate-900/50 p-3 rounded-md font-mono text-xs border border-slate-700">{result.suggestedAdjustments}</p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2 text-slate-200"><Wind className="h-4 w-4 text-blue-400" />Reasoning</h4>
              <p className="text-slate-300">{result.reasoning}</p>
            </div>
          </div>
        )}
        {!isLoading && !result && (
          <div className="text-center py-6">
            <p className="text-slate-400 text-sm mb-4">AI-powered flight suggestions powered by Google Gemini</p>
            <p className="text-xs text-slate-500">Analyzes your telemetry and weather data to optimize your flight plan</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-slate-700/30 pt-6">
        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          {isLoading ? "Analyzing..." : "Analyze & Suggest"}
        </Button>
      </CardFooter>
    </Card>
  );
}
