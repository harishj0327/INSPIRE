import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import NewRequirementPage from '../pages/NewRequirementPage';
import RequirementDetailPage from '../pages/RequirementDetailPage';
import StandardsPage from '../pages/StandardsPage';
import StandardDetailPage from '../pages/StandardDetailPage';
import TenderReviewPage from '../pages/TenderReviewPage';
import SavedPage from '../pages/SavedPage';
import ProjectsPage from '../pages/ProjectsPage';
import AuditPage from '../pages/AuditPage';
import SettingsPage from '../pages/SettingsPage';
import LandingPage from '../pages/LandingPage';
import AppLayout from '../layouts/AppLayout';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="requirements/new" element={<NewRequirementPage />} />
        <Route path="requirements/:id" element={<RequirementDetailPage />} />
        <Route path="standards" element={<StandardsPage />} />
        <Route path="standards/:id" element={<StandardDetailPage />} />
        <Route path="tender-review" element={<TenderReviewPage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
