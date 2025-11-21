"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDroneData } from "@/hooks/use-drone-data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

export function LiveTelemetryChart() {
    const { telemetryHistory } = useDroneData();
  
    return (
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300">
        <CardHeader className="border-b border-slate-700/30">
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            Live Telemetry
          </CardTitle>
          <CardDescription className="text-slate-400">
            Real-time altitude and speed data from the drone.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <LineChart
                data={telemetryHistory}
                margin={{
                  top: 5,
                  right: 30,
                  left: -10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis yAxisId="left" label={{ value: 'Altitude (m)', angle: -90, position: 'insideLeft', fill: '#e2e8f0' }} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Speed (m/s)', angle: -90, position: 'insideRight', fill: '#e2e8f0' }} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-lg">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-slate-400">
                                Time
                              </span>
                              <span className="font-bold text-slate-200">
                                {label}
                              </span>
                            </div>
                            {payload.map((item, index) => (
                                <div className="flex flex-col" key={index}>
                                <span className="text-[0.70rem] uppercase" style={{color: item.color}}>
                                  {item.name}
                                </span>
                                <span className="font-bold" style={{color: item.color}}>
                                  {typeof item.value === 'number' ? item.value.toFixed(1) : item.value} {item.name === 'Altitude' ? 'm' : 'm/s'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Line yAxisId="left" type="monotone" dataKey="altitude" name="Altitude" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="speed" name="Speed" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }
  