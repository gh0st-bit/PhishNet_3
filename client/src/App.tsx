import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
import AuthPage from "@/pages/auth-page";
import CampaignsPage from "@/pages/campaigns-page";
import TemplatesPage from "@/pages/templates-page";
import GroupsPage from "@/pages/groups-page";
import LandingPagesPage from "@/pages/landing-pages-page";
import SmtpProfilesPage from "@/pages/smtp-profiles-page";
import ReportsPage from "@/pages/reports-page";
import UsersPage from "@/pages/users-page";
import SettingsPage from "@/pages/settings-page";
import ProfilePage from "@/pages/profile-page";
import OrganizationPage from "@/pages/organization-page";
import AdminPage from "@/pages/admin-page";
import ForgotPasswordPage from "@/pages/forgot-password-page";
import ResetPasswordPage from "@/pages/reset-password-page";
import EducationPage from "@/pages/education-page";
import TrainingPage from "@/pages/training-page";
import CompliancePage from "@/pages/compliance-page";
import SessionTimeoutWrapper from "@/components/session-timeout-wrapper";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./hooks/use-auth";
import { useEffect } from "react";
import { initSessionManager, cleanupSessionManager } from "./lib/session-manager";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password/:token" component={ResetPasswordPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/campaigns" component={CampaignsPage} />
      <ProtectedRoute path="/templates" component={TemplatesPage} />
      <ProtectedRoute path="/groups" component={GroupsPage} />
      <ProtectedRoute path="/landing-pages" component={LandingPagesPage} />
      <ProtectedRoute path="/smtp-profiles" component={SmtpProfilesPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/users" component={UsersPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/organization" component={OrganizationPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <ProtectedRoute path="/education" component={EducationPage} />
      <ProtectedRoute path="/training" component={TrainingPage} />
      <ProtectedRoute path="/compliance" component={CompliancePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize session tracking for auto-logout
  useEffect(() => {
    // Only initialize session manager on protected routes (when user is logged in)
    if (window.location.pathname !== '/auth' && 
        !window.location.pathname.startsWith('/forgot-password') &&
        !window.location.pathname.startsWith('/reset-password')) {
      initSessionManager();
    }
    
    // Clean up session tracker on unmount
    return () => {
      cleanupSessionManager();
    };
  }, []);
  
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <SessionTimeoutWrapper>
            <Router />
          </SessionTimeoutWrapper>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
