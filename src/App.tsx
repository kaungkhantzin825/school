import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import SearchPage           from './pages/SearchPage';
import UniversityInfoPage   from './pages/UniversityInfoPage';
import VerificationFormPage from './pages/VerificationFormPage';
import VerificationResultPage from './pages/VerificationResultPage';
import LoginPage            from './pages/admin/LoginPage';
import UserAdminDashboard   from './pages/admin/UserAdminDashboard';
import SuperAdminDashboard  from './pages/admin/SuperAdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/"                    element={<SearchPage />} />
          <Route path="/university-info"     element={<UniversityInfoPage />} />
          <Route path="/verification-form"   element={<VerificationFormPage />} />
          <Route path="/verification-result" element={<VerificationResultPage />} />
          <Route path="/login"               element={<LoginPage />} />

          {/* Protected — University Admin */}
          <Route path="/user/admin" element={
            <ProtectedRoute>
              <UserAdminDashboard />
            </ProtectedRoute>
          } />

          {/* Protected — Super Admin only */}
          <Route path="/superadmin/admin" element={
            <ProtectedRoute requireSuperAdmin>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
