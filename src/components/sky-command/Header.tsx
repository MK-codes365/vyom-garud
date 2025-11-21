import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Activity, Wifi } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between gap-4 border-b border-slate-800/50 bg-gradient-to-r from-slate-950/98 via-slate-900/98 to-slate-950/98 px-4 backdrop-blur-xl shadow-2xl shadow-blue-500/10 lg:px-8">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent drop-shadow-lg">
            VyomGarud GCS
          </h1>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" className="text-slate-400 hover:text-slate-300 transition-colors">VyomGarud</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-slate-300">Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400">Live</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30">
          <Wifi className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400">Connected</span>
        </div>
      </div>
    </header>
  );
}
