import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminEventFormPage from './pages/admin/AdminEventFormPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/eventos/:slug" element={<EventDetailPage />} />
        <Route path="/contacto" element={<ContactPage />} />
      </Route>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="eventos" element={<AdminEventsPage />} />
        <Route path="eventos/nuevo" element={<AdminEventFormPage />} />
        <Route path="eventos/:id/editar" element={<AdminEventFormPage />} />
        <Route path="mensajes" element={<AdminMessagesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
