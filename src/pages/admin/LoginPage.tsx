import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { homeRouteForRole, setSession } from '../../utils/auth';
import '../../styles/AuthPages.css';

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M1 1l22 22" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo: string | undefined = location.state?.redirectTo;
  const university = location.state?.university;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;

      setSession(token, user, remember);

      // If they were sent here mid-verification, continue that flow instead
      // of dropping them on a dashboard.
      if (redirectTo) {
        navigate(redirectTo, { replace: true, state: { university } });
      } else {
        navigate(homeRouteForRole(user.role), { replace: true });
      }
    } catch (err: any) {
      setError(err.friendlyMessage || err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/logo-3.png" alt="ACVR" className="auth-logo" />

        {redirectTo && (
          <div className="auth-context">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" />
            </svg>
            <span>
              Continuing the verification process
              {university?.name ? <> for <strong>{university.name}</strong></> : null}.
            </span>
          </div>
        )}

        <h1 className="auth-title">{redirectTo ? 'Sign in to Continue' : 'Sign in'}</h1>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <span className="auth-field-icon"><MailIcon /></span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="username"
              required
            />
          </div>

          <div className="auth-field">
            <span className="auth-field-icon"><LockIcon /></span>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="auth-field-toggle"
              onClick={() => setShowPwd(!showPwd)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              <EyeIcon off={showPwd} />
            </button>
          </div>

          <label className="auth-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            <span>Remember Me</span>
          </label>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footnote">
          If you don't have an account,{' '}
          <a onClick={() => navigate('/register', { state: { redirectTo, university } })}>
            sign up here.
          </a>
        </p>

        <a className="auth-backlink" onClick={() => navigate('/')}>Back to home</a>
      </div>
    </div>
  );
};

export default LoginPage;
