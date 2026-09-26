import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import SearchPage from './pages/SearchPage';
import UniversityInfoPage from './pages/UniversityInfoPage';
import VerificationFormPage from './pages/VerificationFormPage';
import VerificationResultPage from './pages/VerificationResultPage';
import ComingSoonPage from './pages/ComingSoonPage';

// Dashboards are large and only ever seen by signed-in staff, so they are
// split out of the main bundle that every public visitor downloads.
const LoginPage           = lazy(() => import('./pages/admin/LoginPage'));
const RegisterPage        = lazy(() => import('./pages/RegisterPage'));
const UserAdminDashboard  = lazy(() => import('./pages/admin/UserAdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/admin/SuperAdminDashboard'));
const VerifierDashboard   = lazy(() => import('./pages/verifier/VerifierDashboard'));

const PageFallback = () => (
  <div style={{
    minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#64748b', fontFamily: 'system-ui, sans-serif', fontSize: '0.9rem',
  }}>
    Loading…
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/university-info" element={<UniversityInfoPage />} />
            <Route path="/verification-form" element={<VerificationFormPage />} />
            <Route path="/verification-result" element={<VerificationResultPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/user/admin" element={<UserAdminDashboard />} />
            <Route path="/superadmin/admin" element={<SuperAdminDashboard />} />
            <Route path="/verifier/dashboard" element={<VerifierDashboard />} />
            <Route path="/coming-soon" element={<ComingSoonPage />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
