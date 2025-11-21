'use client';

import { Dashboard } from '@/components/sky-command/Dashboard';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DroneControlProvider } from '@/context/drone-control-context';

export default function DashboardPage() {
  return (
    <DroneControlProvider>
      <SidebarProvider>
        <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <Dashboard />
        </div>
      </SidebarProvider>
    </DroneControlProvider>
  );
}
