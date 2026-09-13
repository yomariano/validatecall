import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { UsageProvider } from '@/context/UsageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
const Landing = lazy(() => import('./pages/Landing'));
const PricingPublic = lazy(() => import('./pages/PricingPublic'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Leads = lazy(() => import('./pages/Leads'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const Agents = lazy(() => import('./pages/Agents'));
const History = lazy(() => import('./pages/History'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));
const Inbox = lazy(() => import('./pages/Inbox'));
const Sequences = lazy(() => import('./pages/Sequences'));
const Workflows = lazy(() => import('./pages/Workflows'));
const EmailAnalytics = lazy(() => import('./pages/EmailAnalytics'));
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
            <Suspense fallback={<div role="status" className="p-8 text-center">Loading…</div>}>
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
            <Route path="/inbox" element={<ProtectedLayout><Inbox /></ProtectedLayout>} />
            <Route path="/sequences" element={<ProtectedLayout><Sequences /></ProtectedLayout>} />
            <Route path="/workflows" element={<ProtectedLayout><Workflows /></ProtectedLayout>} />
            <Route path="/email-analytics" element={<ProtectedLayout><EmailAnalytics /></ProtectedLayout>} />
            <Route path="/admin" element={<ProtectedLayout><Admin /></ProtectedLayout>} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </UsageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
