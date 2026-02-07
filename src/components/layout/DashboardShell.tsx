import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="flex h-14 items-center gap-3 border-b border-border px-4 shrink-0">
            <SidebarTrigger />
          </header>
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
