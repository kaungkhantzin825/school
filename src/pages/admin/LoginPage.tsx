import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/admin/LoginPage.css';

const LoginPage = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // After login, isSuperAdmin is updated – but state hasn't re-rendered yet
      // So read role from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'super_admin') {
        navigate('/superadmin/admin');
      } else {
        navigate('/user/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fill = (e: string, p: string) => { setEmail(e); setPassword(p); };

  return (
    <div className="login-page">

      {/* ── Left branding panel ── */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">🎓</div>
          <h1>Degree Verification Portal</h1>
          <p>Secure, fast, and official academic credential verification for administrators.</p>
        </div>

        <div className="login-features">
          <div className="login-feature">
            <span className="login-feature-icon">🔒</span>
            <span>Role-based access control</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">🏛️</span>
            <span>Multi-university management</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">📊</span>
            <span>Real-time analytics &amp; logs</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">📁</span>
            <span>Bulk CSV student upload</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your admin account to continue</p>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email">Email Address</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">✉️</span>
                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔑</span>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className="login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPwd(!showPwd)}
                  title={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <><div className="login-spinner" /> Signing in...</>
              ) : (
                '→ Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="demo-box">
            <h4>🧪 Demo Credentials</h4>
            <div
              className="demo-credential"
              style={{ cursor: 'pointer' }}
              onClick={() => fill('superadmin@system.com', 'password123')}
              title="Click to autofill"
            >
              <strong>👑 Super Admin</strong>
              <code>superadmin@system.com</code>
            </div>
            <div
              className="demo-credential"
              style={{ cursor: 'pointer' }}
              onClick={() => fill('john@um1.edu', 'password123')}
              title="Click to autofill"
            >
              <strong>🏛️ University Admin</strong>
              <code>john@um1.edu</code>
            </div>
          </div>

          <p className="login-back">
            ← <Link to="/">Back to verification portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
