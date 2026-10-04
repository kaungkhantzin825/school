import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { homeRouteForRole } from '../../utils/auth';
import '../../styles/admin/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo: string | undefined = location.state?.redirectTo;
  const university = location.state?.university;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // If they were sent here mid-verification, continue that flow instead
      // of dropping them on a dashboard.
      if (redirectTo) {
        navigate(redirectTo, { replace: true, state: { university } });
      } else {
        navigate(homeRouteForRole(user.role), { replace: true });
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
          <h1>Graduate Record Data Entry System</h1>
          <p>Secure credential verification for educational institutions</p>
        </div>

      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h2>{redirectTo ? 'Sign in to Verify' : 'Data Entry Portal Login'}</h2>
            <p>
              {redirectTo
                ? 'Credential checks are recorded against your organisation, so please sign in to continue.'
                : 'Enter your credentials to access the dashboard'}
            </p>
          </div>

          {redirectTo && university?.name && (
            <div className="login-context-note">
              🏛️ Continuing verification for <strong>{university.name}</strong>
            </div>
          )}

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

          <p className="login-signup-hint">
            If you don't have an account,{' '}
            <a onClick={() => navigate('/register', { state: { redirectTo, university } })}>
              sign up here
            </a>
          </p>

          <div className="login-back">
            <a href="/">← Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
