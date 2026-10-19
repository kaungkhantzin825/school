import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import '../../styles/AuthPages.css';

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Carried over from the sign-in form when the user clicked "Forgot password?"
  const [email, setEmail] = useState<string>(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(
        err.friendlyMessage ||
        err.response?.data?.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <img src="/logo-3.png" alt="ACVR" className="auth-logo" />

          <div className="auth-success">
            <div className="auth-success-icon">✉️</div>
            <h1>Check your inbox</h1>
            <p>
              If <strong>{email}</strong> is registered with ACVR, we've sent a link
              to reset your password.
            </p>
            <p>
              The link expires in 60 minutes and can only be used once. If it
              hasn't arrived in a few minutes, check your spam folder.
            </p>
          </div>

          <a className="auth-backlink" onClick={() => navigate('/login')}>
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/logo-3.png" alt="ACVR" className="auth-logo" />

        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">
          Enter the email address on your ACVR account and we'll send you a link
          to choose a new password.
        </p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <span className="auth-field-icon"><MailIcon /></span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
            style={{ marginTop: '0.9rem' }}
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-footnote">
          Remembered it?{' '}
          <a onClick={() => navigate('/login')}>sign in here.</a>
        </p>

        <a className="auth-backlink" onClick={() => navigate('/')}>Back to home</a>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
