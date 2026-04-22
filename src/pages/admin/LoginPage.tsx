import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import '../../styles/admin/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
      if (user.role === 'super_admin') {
        navigate('/superadmin/admin');
      } else {
        navigate('/user/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">🎓</div>
          <h1>University Verification System</h1>
          <p>Secure credential verification for educational institutions</p>
        </div>

        <div className="login-features">
          <div className="login-feature">
            <span className="login-feature-icon">✓</span>
            <span>Instant verification</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">🔒</span>
            <span>Secure & encrypted</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">📊</span>
            <span>Real-time analytics</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h2>Admin Login</h2>
            <p>Enter your credentials to access the dashboard</p>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Email Address</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">📧</span>
                <input
                  type="email"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="demo-box">
            <h4>🔑 Demo Credentials</h4>
            <div className="demo-credential">
              <strong>
                <span>👑</span>
                <span>Super Admin</span>
              </strong>
              <code>superadmin@system.com</code>
            </div>
            <div className="demo-credential">
              <strong>
                <span>🎓</span>
                <span>University Admin</span>
              </strong>
              <code>john@um1.edu</code>
            </div>
            <div className="demo-credential">
              <strong>
                <span>🔑</span>
                <span>Password</span>
              </strong>
              <code>password123</code>
            </div>
          </div>

          <div className="login-back">
            <a href="/">← Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
