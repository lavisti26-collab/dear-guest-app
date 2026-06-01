import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import PublicInvitationPage from "./pages/PublicInvitationPage";
import AdminRoute from "./pages/AdminRoute";
import SuperAdminPage from "./pages/SuperAdminPage";
import DashboardShellPage from "./pages/DashboardShellPage";
import AuthGuard from "./components/AuthGuard";
import NotFound from "./pages/NotFound";
// Note: ThemeProvider is intentionally NOT used here at the root level.
// Each page (AdminRoute, PublicInvitationPage) mounts its own ThemeProvider
// once it knows the actual profile/theme. CSS :root vars in index.css provide
// the gold fallback until JS applies a theme.

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/hub" element={<DashboardShellPage forcedRole="guest" />} />
          <Route
            path="/dashboard"
            element={<Navigate to="/admin/super?tab=system" replace />}
          />
          <Route
            path="/admin/workspace"
            element={<Navigate to="/admin" replace />}
          />
          <Route path="/invite/:slug" element={<PublicInvitationPage />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/admin/super" element={<SuperAdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
