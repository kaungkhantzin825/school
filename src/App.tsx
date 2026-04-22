import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import UniversityInfoPage from './pages/UniversityInfoPage';
import VerificationFormPage from './pages/VerificationFormPage';
import VerificationResultPage from './pages/VerificationResultPage';
import UserAdminDashboard from './pages/admin/UserAdminDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import LoginPage from './pages/admin/LoginPage';
import DegreeManagement from './pages/admin/DegreeManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/university-info" element={<UniversityInfoPage />} />
        <Route path="/verification-form" element={<VerificationFormPage />} />
        <Route path="/verification-result" element={<VerificationResultPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user/admin" element={<UserAdminDashboard />} />
        <Route path="/superadmin/admin" element={<SuperAdminDashboard />} />
        <Route path="/admin/degrees" element={<DegreeManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
