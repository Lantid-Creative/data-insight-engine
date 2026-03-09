import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ConsultingPage from "./pages/ConsultingPage";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import CareersPage from "./pages/CareersPage";
import ContactPage from "./pages/ContactPage";
import ApiDocsPage from "./pages/ApiDocsPage";
import ChangelogPage from "./pages/ChangelogPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import SecurityPage from "./pages/SecurityPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import UploadPage from "./pages/dashboard/UploadPage";
import ProcessingPage from "./pages/dashboard/ProcessingPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import ProjectsPage from "./pages/dashboard/ProjectsPage";
import ProjectDetailPage from "./pages/dashboard/ProjectDetailPage";
import BillingPage from "./pages/dashboard/BillingPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import ApiAccessPage from "./pages/dashboard/ApiAccessPage";
import TeamsPage from "./pages/dashboard/TeamsPage";
import NotificationPreferencesPage from "./pages/dashboard/NotificationPreferencesPage";
import SecuritySettingsPage from "./pages/dashboard/SecuritySettingsPage";
import ClinicalCoPilotPage from "./pages/dashboard/ClinicalCoPilotPage";
import PHIRedactionPage from "./pages/dashboard/PHIRedactionPage";
import EpidemicDashboardPage from "./pages/dashboard/EpidemicDashboardPage";
import PipelineBuilderPage from "./pages/dashboard/PipelineBuilderPage";
import RegulatorySubmissionPage from "./pages/dashboard/RegulatorySubmissionPage";
import DataRoomsPage from "./pages/dashboard/DataRoomsPage";
import CommunityForumPage from "./pages/dashboard/CommunityForumPage";
import UseCaseDetailPage from "./pages/use-cases/UseCaseDetailPage";
import PromptLibraryPage from "./pages/dashboard/PromptLibraryPage";
import HMSLandingPage from "./pages/hms/HMSLandingPage";
import HMSLoginPage from "./pages/hms/auth/HMSLoginPage";
import HMSRegisterPage from "./pages/hms/auth/HMSRegisterPage";
import HMSLayout from "./components/hms/HMSLayout";
import HMSAdminDashboard from "./pages/hms/departments/AdminDashboard";
import DoctorPortal from "./pages/hms/departments/DoctorPortal";
import NurseStation from "./pages/hms/departments/NurseStation";
import Pharmacy from "./pages/hms/departments/Pharmacy";
import Laboratory from "./pages/hms/departments/Laboratory";
import Reception from "./pages/hms/departments/Reception";
import Billing from "./pages/hms/departments/Billing";
import RosterManagement from "./pages/hms/departments/RosterManagement";
import HospitalPublicPage from "./pages/hms/HospitalPublicPage";
import { DomainRedirector } from "./pages/hms/DomainResolver";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/consulting" element={<ConsultingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/api-docs" element={<ApiDocsPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/use-cases/:slug" element={<UseCaseDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/pending" element={<PendingApprovalPage />} />
              
              {/* HMS Routes */}
              <Route path="/hms" element={<HMSLandingPage />} />
              <Route path="/hms/login" element={<HMSLoginPage />} />
              <Route path="/hms/register" element={<HMSRegisterPage />} />
              
              <Route path="/hms" element={<ProtectedRoute><HMSLayout /></ProtectedRoute>}>
                <Route path="admin" element={<HMSAdminDashboard />} />
                <Route path="doctor" element={<DoctorPortal />} />
                <Route path="nurse" element={<NurseStation />} />
                <Route path="pharmacy" element={<Pharmacy />} />
                <Route path="lab" element={<Laboratory />} />
                <Route path="reception" element={<Reception />} />
                <Route path="billing" element={<Billing />} />
                <Route path="roster" element={<RosterManagement />} />
              </Route>

              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<DashboardHome />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="process" element={<ProcessingPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                <Route path="prompts" element={<PromptLibraryPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="api" element={<ApiAccessPage />} />
                <Route path="teams" element={<TeamsPage />} />
                <Route path="notifications" element={<NotificationPreferencesPage />} />
                <Route path="security" element={<SecuritySettingsPage />} />
                <Route path="copilot" element={<ClinicalCoPilotPage />} />
                <Route path="phi-redaction" element={<PHIRedactionPage />} />
                <Route path="epidemic" element={<EpidemicDashboardPage />} />
                <Route path="pipelines" element={<PipelineBuilderPage />} />
                <Route path="submissions" element={<RegulatorySubmissionPage />} />
                <Route path="data-rooms" element={<DataRoomsPage />} />
                <Route path="community" element={<CommunityForumPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
