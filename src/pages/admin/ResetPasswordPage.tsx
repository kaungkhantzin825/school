import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import '../../styles/AuthPages.css';

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

const MIN_LENGTH = 8;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // A hand-edited or truncated link lands here without a token — say so
  // plainly instead of showing a form that can never succeed.
  if (!token || !email) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <img src="/logo-3.png" alt="ACVR" className="auth-logo" />

          <h1 className="auth-title">Invalid reset link</h1>
          <p className="auth-subtitle">
            This link is missing its reset token, or it was copied incompletely.
            Request a new one and use the link from that email.
          </p>

          <button
            type="button"
            className="auth-submit"
            onClick={() => navigate('/forgot-password')}
          >
            Request New Link
          </button>

          <a className="auth-backlink" onClick={() => navigate('/login')}>
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <img src="/logo-3.png" alt="ACVR" className="auth-logo" />

          <div className="auth-success">
            <div className="auth-success-icon">✅</div>
            <h1>Password updated</h1>
            <p>
              Your password for <strong>{email}</strong> has been changed. Any other
              device that was signed in has been signed out.
            </p>
          </div>

          <button
            type="button"
            className="auth-submit"
            onClick={() => navigate('/login', { state: { email } })}
          >
            Sign In
          </button>

          <a className="auth-backlink" onClick={() => navigate('/')}>Back to home</a>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < MIN_LENGTH) {
      setError(`Your password must be at least ${MIN_LENGTH} characters long.`);
      return;
    }

    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({
        token,
        email,
        password,
        password_confirmation: confirm,
      });
      setDone(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.friendlyMessage ||
        'We could not reset your password. Please request a new link.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/logo-3.png" alt="ACVR" className="auth-logo" />

        <h1 className="auth-title">Choose a new password</h1>
        <p className="auth-subtitle">
          Setting a new password for <strong>{email}</strong>.
        </p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <span className="auth-field-icon"><LockIcon /></span>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
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

          <div className="auth-field">
            <span className="auth-field-icon"><LockIcon /></span>
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              required
            />
          </div>

          <span className="auth-hint">
            At least {MIN_LENGTH} characters. Use a mix of letters, numbers and symbols.
          </span>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
            style={{ marginTop: '1.1rem' }}
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>

        <p className="auth-footnote">
          Link expired?{' '}
          <a onClick={() => navigate('/forgot-password')}>request a new one.</a>
        </p>

        <a className="auth-backlink" onClick={() => navigate('/login')}>
          Back to sign in
        </a>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
