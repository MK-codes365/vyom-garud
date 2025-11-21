"use client";

import { useState, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Zap, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LiveDashboard } from "./LiveDashboard";
import { MissionControl } from "./MissionControl";
import { AdvancedSettings } from "./AdvancedSettings";

const LoadingFallback = () => (
  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
    <CardContent className="p-6 h-64 flex items-center justify-center text-slate-400">
      <div className="text-center animate-pulse">Loading...</div>
    </CardContent>
  </Card>
);

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800/50 border border-slate-700/50 p-1">
          <TabsTrigger
            value="live"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Live Dashboard</span>
            <span className="sm:hidden">Live</span>
          </TabsTrigger>
          <TabsTrigger
            value="mission"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Mission Control</span>
            <span className="sm:hidden">Mission</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* Live Dashboard Tab */}
        <TabsContent value="live" className="space-y-6">
          <Suspense fallback={<LoadingFallback />}>
            <LiveDashboard />
          </Suspense>
        </TabsContent>

        {/* Mission Control Tab */}
        <TabsContent value="mission" className="space-y-6">
          <Suspense fallback={<LoadingFallback />}>
            <MissionControl />
          </Suspense>
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Suspense fallback={<LoadingFallback />}>
            <AdvancedSettings />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
