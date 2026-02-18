import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ToastNotification';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MemberManagement from './pages/MemberManagement';
import Onboarding from './pages/Onboarding';
import Reporting from './pages/Reporting';
import Campaigns from './pages/Campaigns';
import Settings from './pages/Settings';
import MemberOnboardingStatus from './pages/MemberOnboardingStatus';
import DataHygiene from './pages/DataHygiene';
import Glossary from './pages/Glossary';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/members" replace />} />
            <Route path="members" element={<MemberManagement />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="reporting" element={<Reporting />} />
            <Route path="member-onboarding-status" element={<MemberOnboardingStatus />} />
            <Route path="data-hygiene" element={<DataHygiene />} />
            <Route path="glossary" element={<Glossary />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
