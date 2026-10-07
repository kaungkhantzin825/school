import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { registrationAPI } from '../services/api';
import { setSession } from '../utils/auth';
import '../styles/AuthPages.css';

const ORG_TYPES = [
  'Employers',
  'Recruitment Agencies',
  'Higher Education Institutions',
  'Government Departments',
  'Background Check Agency',
  'Private Company',
  'Embassy / Consulate',
  'Other',
];

const COUNTRIES = [
  'Myanmar', 'Singapore', 'Thailand', 'Malaysia', 'India', 'China', 'Japan',
  'South Korea', 'United Kingdom', 'United States', 'Australia', 'Germany',
  'France', 'Canada', 'United Arab Emirates', 'Other',
];

type OtpState = 'idle' | 'sent' | 'verified';

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

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo: string | undefined = location.state?.redirectTo;
  const university = location.state?.university;

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    organization_name: '',
    organization_type: '',
    country: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  /* ── Email OTP (demo) ── */
  const [otpState, setOtpState] = useState<OtpState>('idle');
  const [generatedCode, setGeneratedCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k: string, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    // Changing the email invalidates any code already sent to the old one.
    if (k === 'email') {
      setOtpState('idle');
      setOtpInput('');
      setOtpError('');
    }
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const canSendOtp = emailValid && otpState !== 'verified';
  const passwordLongEnough = form.password.length >= 8;
  const passwordsMatch = form.password.length > 0 && form.password === form.password_confirmation;

  const sendOtp = () => {
    if (!emailValid) {
      setError('Please enter a valid email address before sending the code.');
      return;
    }
    setGeneratedCode(String(Math.floor(100000 + Math.random() * 900000)));
    setOtpState('sent');
    setOtpInput('');
    setOtpError('');
    setError('');
  };

  const verifyOtp = () => {
    if (otpInput.trim().length !== 6) {
      setOtpError('Enter the 6-digit code sent to your email.');
      return;
    }
    if (otpInput.trim() !== generatedCode) {
      setOtpError('Incorrect code. Please try again.');
      return;
    }
    setOtpState('verified');
    setOtpError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailValid) { setError('Please enter a valid email address.'); return; }
    if (!passwordLongEnough) { setError('Your password must be at least 8 characters long.'); return; }
    if (!passwordsMatch) { setError('Password and Confirm Password must match.'); return; }
    if (otpState !== 'verified') { setError('Please complete Email OTP Authentication first.'); return; }
    if (!agreeTerms || !agreePrivacy) { setError('You must accept the terms and the privacy policy.'); return; }

    setLoading(true);
    try {
      const response = await registrationAPI.create({
        ...form,
        email_verified: true,
        agreed_terms: agreeTerms,
        agreed_privacy: agreePrivacy,
      });

      if (response.data?.token && response.data?.user) {
        setSession(response.data.token, response.data.user, true);
      }

      setDone(true);
      setTimeout(() => {
        navigate(redirectTo || '/verifier/dashboard', { replace: true, state: { university } });
      }, 1800);
    } catch (err: any) {
      const resp = err.response?.data;
      setError(
        resp?.message ||
        (resp?.errors ? Object.values(resp.errors).flat().join(' ') : '') ||
        err.friendlyMessage ||
        'Something went wrong. Please check your inputs and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <img src="/logo-3.png" alt="ACVR" className="auth-logo" />
          <div className="auth-success">
            <div className="auth-success-icon">🎉</div>
            <h1>Registration Successful!</h1>
            <p>
              Welcome, <strong>{form.full_name}</strong>. Your verifier account for{' '}
              <strong>{form.organization_name}</strong> is ready — sign in any time with{' '}
              <strong>{form.email}</strong> and the password you chose.
            </p>
            <p style={{ color: '#94a3b8' }}>Taking you to your dashboard…</p>
            <button
              className="auth-submit"
              onClick={() => navigate(redirectTo || '/verifier/dashboard', { state: { university } })}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
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

        <h1 className="auth-title">Create your verifier account</h1>
        <p className="auth-subtitle">
          This service is for third-party organisations — employers, recruitment agencies,
          institutions and government departments — verifying academic credentials.
        </p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <h2 className="auth-section-title">Your details</h2>

          <div className="auth-field no-icon">
            <label className="auth-label" htmlFor="reg-fullname">Full Name</label>
            <input
              id="reg-fullname"
              type="text"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              required
            />
          </div>

          <div className="auth-field no-icon">
            <label className="auth-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-grid">
            <div className="auth-field no-icon">
              <label className="auth-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="auth-field-toggle"
                style={{ top: 'auto', bottom: '0.55rem', transform: 'none' }}
                onClick={() => setShowPwd(!showPwd)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                <EyeIcon off={showPwd} />
              </button>
              {form.password.length > 0 && !passwordLongEnough && (
                <span className="auth-hint auth-hint-error">Use at least 8 characters.</span>
              )}
            </div>

            <div className="auth-field no-icon">
              <label className="auth-label" htmlFor="reg-password-confirm">Confirm Password</label>
              <input
                id="reg-password-confirm"
                type={showPwd ? 'text' : 'password'}
                value={form.password_confirmation}
                onChange={e => set('password_confirmation', e.target.value)}
                autoComplete="new-password"
                required
              />
              {form.password_confirmation.length > 0 && !passwordsMatch && (
                <span className="auth-hint auth-hint-error">Passwords do not match.</span>
              )}
            </div>
          </div>

          {/* Email OTP */}
          <div className="auth-otp">
            <div className="auth-otp-head">
              <span className="auth-otp-label">Email OTP Authentication</span>
              <span className={`auth-badge ${otpState === 'verified' ? 'ok' : ''}`}>
                {otpState === 'verified' ? '✓ Verified' : 'Required'}
              </span>
            </div>

            {otpState === 'idle' && (
              <button type="button" className="auth-btn-sm" onClick={sendOtp} disabled={!canSendOtp}>
                Send verification code
              </button>
            )}

            {otpState === 'sent' && (
              <>
                <p className="auth-otp-demo">
                  📬 Demo code sent to <strong>{form.email}</strong>: <strong>{generatedCode}</strong>
                </p>
                <div className="auth-otp-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  />
                  <button type="button" className="auth-btn-sm" onClick={verifyOtp}>Verify</button>
                  <button type="button" className="auth-link-btn" onClick={sendOtp}>Resend</button>
                </div>
                {otpError && <span className="auth-hint auth-hint-error">{otpError}</span>}
              </>
            )}

            {otpState === 'verified' && (
              <span className="auth-hint" style={{ color: '#15803d' }}>✓ Email verified successfully.</span>
            )}
          </div>

          <h2 className="auth-section-title">Your organisation details</h2>

          <div className="auth-field no-icon">
            <label className="auth-label" htmlFor="reg-orgname">Organization Name</label>
            <input
              id="reg-orgname"
              type="text"
              value={form.organization_name}
              onChange={e => set('organization_name', e.target.value)}
              required
            />
          </div>

          <div className="auth-grid">
            <div className="auth-field no-icon">
              <label className="auth-label" htmlFor="reg-orgtype">Organization type</label>
              <select
                id="reg-orgtype"
                value={form.organization_type}
                onChange={e => set('organization_type', e.target.value)}
                required
              >
                <option value="">Please select…</option>
                {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="auth-field no-icon">
              <label className="auth-label" htmlFor="reg-country">Country</label>
              <select
                id="reg-country"
                value={form.country}
                onChange={e => set('country', e.target.value)}
                required
              >
                <option value="">Please select…</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="auth-terms">
            By registering, you agree to the{' '}
            <a className="auth-link-btn" onClick={() => navigate('/coming-soon', { state: { title: 'Privacy Policy' } })}>privacy policy</a>
            {' '}and the{' '}
            <a className="auth-link-btn" onClick={() => navigate('/coming-soon', { state: { title: 'Terms and Conditions' } })}>terms and conditions</a>.

            <label className="auth-check">
              <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} />
              <span>I have read and agree to the terms and conditions of use of the service</span>
            </label>
            <label className="auth-check">
              <input type="checkbox" checked={agreePrivacy} onChange={e => setAgreePrivacy(e.target.checked)} />
              <span>I have read the privacy policy</span>
            </label>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit'}
          </button>
        </form>

        <p className="auth-footnote">
          Already have an account?{' '}
          <a onClick={() => navigate('/login', { state: { redirectTo, university } })}>Sign in here.</a>
        </p>

        <a className="auth-backlink" onClick={() => navigate('/')}>Back to home</a>
      </div>
    </div>
  );
};

export default RegisterPage;
