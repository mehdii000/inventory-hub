import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import { DashboardShell } from "@/components/layout/DashboardShell";
import ProcessorsPage from "@/pages/ProcessorsPage";
import HistoryPage from "@/pages/HistoryPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <HistoryProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DashboardShell>
              <Routes>
                <Route path="/" element={<ProcessorsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DashboardShell>
          </BrowserRouter>
        </HistoryProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
