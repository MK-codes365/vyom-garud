import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface TelemetryCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  className?: string;
}

export function TelemetryCard({
  title,
  value,
  unit,
  icon: Icon,
  className,
}: TelemetryCardProps) {
  return (
    <Card className={cn(
      "group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/40 hover:border-blue-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden",
      className
    )}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">{title}</CardTitle>
        <div className="p-2 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 rounded-lg group-hover:from-blue-500/40 group-hover:to-cyan-500/30 transition-all duration-300 border border-blue-500/20">
          <Icon className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-cyan-200 transition-all">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                {unit}
              </span>
            )}
          </div>
          <div className="h-0.5 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardContent>
    </Card>
  );
}
