import { ScrollArea } from "@/components/ui/scroll-area";
import { AISuggestionsPanel } from "./AISuggestionsPanel";
import { FlightPathPanel } from "./FlightPathPanel";
import { GeofencePanel } from "./GeofencePanel";
import { Header } from "./Header";
import { ManualControlPanel } from "./ManualControlPanel";
import { TelemetryPanel } from "./TelemetryPanel";
import { LiveTelemetryChart } from "./LiveTelemetryChart";

export function Dashboard() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      <ScrollArea className="flex-1">
        <main className="p-6 lg:p-8">
          {/* Telemetry Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-200 mb-4">Live Telemetry</h2>
            <TelemetryPanel />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Left Column - Maps and Charts */}
            <div className="col-span-1 flex flex-col gap-6 xl:col-span-2">
              <div>
                <h2 className="text-lg font-bold text-slate-200 mb-4">Flight Path & Monitoring</h2>
                <FlightPathPanel />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-200 mb-4">Performance Analytics</h2>
                <LiveTelemetryChart />
              </div>
            </div>

            {/* Right Column - Controls and Settings */}
            <div className="col-span-1 flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-bold text-slate-200 mb-4">Control Panel</h2>
                <ManualControlPanel />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-200 mb-4">Safety & Boundaries</h2>
                <GeofencePanel />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-200 mb-4">AI Assistant</h2>
                <AISuggestionsPanel />
              </div>
            </div>
          </div>
        </main>
      </ScrollArea>
    </div>
  );
}
