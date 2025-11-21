"use client";

import { useDroneData } from "@/hooks/use-drone-data";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ConnectionStatus() {
  const { isConnected } = useDroneData();

  if (isConnected === undefined) {
    return (
       <div className="flex items-center gap-2 px-2">
         <Skeleton className="h-4 w-4 rounded-full" />
         <Skeleton className="h-4 w-20" />
       </div>
     )
   }

  return (
    <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
      <div className="relative flex h-8 w-8 items-center justify-center">
        <div
          className={cn(
            "absolute h-6 w-6 rounded-full",
            isConnected ? "bg-primary/10 animate-pulse" : "bg-destructive/10"
          )}
        />
        {isConnected ? (
          <Wifi className="h-4 w-4 text-primary" />
        ) : (
          <WifiOff className="h-4 w-4 text-destructive" />
        )}
      </div>
      <div className="flex flex-col group-data-[collapsible=icon]:hidden">
        <span
          className={cn(
            "text-sm font-medium",
            isConnected ? "text-primary" : "text-destructive"
          )}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </span>
        <span className="text-xs text-muted-foreground">MAVLink</span>
      </div>
    </div>
  );
}
