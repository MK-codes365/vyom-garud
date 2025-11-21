import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "./Header";
import { DashboardTabs } from "./DashboardTabs";

export function Dashboard() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      <ScrollArea className="flex-1">
        <main className="p-6 lg:p-8">
          <DashboardTabs />
        </main>
      </ScrollArea>
    </div>
  );
}
