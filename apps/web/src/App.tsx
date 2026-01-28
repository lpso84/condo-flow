import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';
import { apiClient } from './lib/api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AppLayout from './components/layout/AppLayout';
import CondominiumsPage from './pages/CondominiumsPage';
import CondominiumDetailPage from './pages/CondominiumDetailPage';
import SuppliersPage from './pages/SuppliersPage';
import ProjectsPage from './pages/ProjectsPage';
import FractionsPage from './pages/FractionsPage';
import OccurrencesPage from './pages/OccurrencesPage';
import FinancesPage from './pages/FinancesPage';
import AssembliesPage from './pages/AssembliesPage';
import DocumentsPage from './pages/DocumentsPage';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

// Settings Imports
import { SettingsLayout } from './components/settings/SettingsLayout';
import SettingsPage from './pages/settings/SettingsPage';
import UsersSettingsPage from './pages/settings/UsersSettingsPage';
import OccurrenceCategoriesPage from './pages/settings/OccurrenceCategoriesPage';
import WorkflowsPage from './pages/settings/WorkflowsPage';
import FinancialSettingsPage from './pages/settings/FinancialSettingsPage';
import AuditPage from './pages/settings/AuditPage';

// Placeholder pages for routes that aren't implemented yet
const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground">Esta página está em desenvolvimento.</p>
    </div>
);

function App() {
    const { isAuthenticated, setUser } = useAuthStore();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            apiClient
                .getCurrentUser()
                .then(setUser)
                .catch(() => {
                    apiClient.logout();
                });
        }
    }, [setUser]);

    return (
        <>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}
                >
                    <Route index element={<DashboardPage />} />
                    <Route path="condominiums" element={<CondominiumsPage />} />
                    <Route path="condominiums/:id" element={<CondominiumDetailPage />} />

                    <Route path="fractions" element={<FractionsPage />} />
                    <Route path="occurrences" element={<OccurrencesPage />} />
                    <Route path="finances" element={<FinancesPage />} />
                    <Route path="suppliers" element={<SuppliersPage />} />
                    <Route path="projects" element={<ProjectsPage />} />

                    <Route path="assemblies" element={<AssembliesPage />} />
                    <Route path="documents" element={<DocumentsPage />} />

                    {/* Settings Routes */}
                    <Route path="settings" element={<SettingsLayout />}>
                        <Route index element={<SettingsPage />} />
                        <Route path="users" element={<UsersSettingsPage />} />
                        <Route path="occurrence-categories" element={<OccurrenceCategoriesPage />} />
                        <Route path="workflows" element={<WorkflowsPage />} />
                        <Route path="financial" element={<FinancialSettingsPage />} />
                        <Route path="audit" element={<AuditPage />} />
                        <Route path="*" element={<PlaceholderPage title="Em desenvolvimento" />} />
                    </Route>
                </Route>
            </Routes>
            <Toaster />
            <SonnerToaster richColors position="top-right" />
        </>
    );
}

export default App;
