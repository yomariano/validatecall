import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { UsageProvider } from '@/context/UsageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import PricingPublic from './pages/PricingPublic';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Campaigns from './pages/Campaigns';
import Agents from './pages/Agents';
import History from './pages/History';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import { trackRouteChange } from '@/lib/analytics';
import './App.css';

// Component to track page views on route changes
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    trackRouteChange(location.pathname);
  }, [location.pathname]);

  return null;
}

// Helper component for protected routes with layout
const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <Layout>
      {children}
    </Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UsageProvider>
          <BrowserRouter>
            <PageTracker />
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<PricingPublic />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Protected routes - flat structure */}
            <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/leads" element={<ProtectedLayout><Leads /></ProtectedLayout>} />
            <Route path="/campaigns" element={<ProtectedLayout><Campaigns /></ProtectedLayout>} />
            <Route path="/agents" element={<ProtectedLayout><Agents /></ProtectedLayout>} />
            <Route path="/history" element={<ProtectedLayout><History /></ProtectedLayout>} />
            <Route path="/billing" element={<ProtectedLayout><Pricing /></ProtectedLayout>} />
            <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </UsageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
