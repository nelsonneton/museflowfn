import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArtistProvider } from "@/contexts/ArtistContext";
import { ArtistSelector } from "@/components/ArtistSelector";
import Dashboard from "@/pages/dashboard";
import Artists from "@/pages/artists";
import ArtistProfilePage from "@/pages/ArtistProfilePage";
import RealityGraph from "@/pages/reality-graph";
import TimelinePage from "@/pages/TimelinePage";
import ArchetypesPage from "@/pages/ArchetypesPage";
import CalendarPage from "@/pages/CalendarPage";
import Projects from "@/pages/projects";
import AIGeneration from "@/pages/ai-generation";
import Curation from "@/pages/curation";
import Social from "@/pages/social";
import Marketplace from "@/pages/marketplace";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/artists" component={Artists} />
      <Route path="/artists/:id" component={ArtistProfilePage} />
      <Route path="/reality-graph" component={RealityGraph} />
      <Route path="/timeline" component={TimelinePage} />
      <Route path="/archetypes" component={ArchetypesPage} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/projects" component={Projects} />
      <Route path="/ai-generation" component={AIGeneration} />
      <Route path="/curation" component={Curation} />
      <Route path="/social" component={Social} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="dark">
          <ArtistProvider>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-4">
                      <SidebarTrigger data-testid="button-sidebar-toggle" />
                      <h2 className="font-semibold text-lg">Artist Muse Flow</h2>
                    </div>
                    <div className="flex items-center gap-4">
                      <ArtistSelector />
                      <ThemeToggle />
                    </div>
                  </header>
                  <main className="flex-1 overflow-auto p-8">
                    <Router />
                  </main>
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
          </ArtistProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
