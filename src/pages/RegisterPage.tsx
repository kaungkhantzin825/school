import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/RegisterPage.css';

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

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    confirm_email: '',
    password: '',
    password_confirmation: '',
    organization_name: '',
    organization_type: '',
    country: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  /* ── Email OTP Simulation ── */
  const [otpState, setOtpState] = useState<OtpState>('idle');
  const [generatedCode, setGeneratedCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k: string, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (k === 'email' || k === 'confirm_email') {
      setOtpState('idle');
      setOtpInput('');
      setOtpError('');
    }
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const emailsMatch = form.email.length > 0 && form.email === form.confirm_email;
  const canSendOtp = emailValid && emailsMatch && otpState !== 'verified';

  const passwordLongEnough = form.password.length >= 8;
  const passwordsMatch = form.password.length > 0 && form.password === form.password_confirmation;

  const sendOtp = () => {
    if (!emailsMatch) {
      setError('Email and Confirm Email must match before sending code.');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
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

    if (!emailsMatch) {
      setError('Email and Confirm Email must match.');
      return;
    }
    if (!passwordLongEnough) {
      setError('Your password must be at least 8 characters long.');
      return;
    }
    if (!passwordsMatch) {
      setError('Password and Confirm Password must match.');
      return;
    }
    if (otpState !== 'verified') {
      setError('Please complete Email OTP Authentication first.');
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError('You must accept the terms and conditions and the privacy policy.');
      return;
    }

    setLoading(true);
    try {
      const response = await registrationAPI.create({
        ...form,
        email_verified: true,
        agreed_terms: agreeTerms,
        agreed_privacy: agreePrivacy,
      });

      // Auto login to Verifier Dashboard
      if (response.data?.token && response.data?.user) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      setDone(true);
      setTimeout(() => {
        navigate('/verifier/dashboard');
      }, 1800);
    } catch (err: any) {
      const resp = err.response?.data;
      setError(
        resp?.message ||
        (resp?.errors ? Object.values(resp.errors).flat().join(' ') : '') ||
        'Something went wrong. Please check your inputs and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="reg-page">
        <Header />
        <main className="reg-main">
          <div className="reg-success">
            <div className="reg-success-icon">🎉</div>
            <h1>Registration Successful!</h1>
            <p>
              Welcome, <strong>{form.full_name}</strong>! Your verifier account for{' '}
              <strong>{form.organization_name}</strong> is ready. Sign in any time with{' '}
              <strong>{form.email}</strong> and the password you just chose.
            </p>
            <p className="reg-redirect-notice">
              Redirecting you to your <strong>Verifier Side Dashboard</strong>...
            </p>
            <button className="reg-btn-primary" onClick={() => navigate('/verifier/dashboard')}>
              Go to Verifier Dashboard Now →
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="reg-page">
      <Header />

      <main className="reg-main">
        <div className="reg-content-container">

          {/* ── Who Should Register? Banner (Image 3 & 5) ── */}
          <div className="reg-banner-wrap">
            <img
              src="/logsss.jpg"
              alt="Who Should Register? Verification service designed for third-party organizations"
              className="reg-banner-img"
            />
          </div>

          {/* ── Registration Form (Image 5) ── */}
          <form className="reg-form" onSubmit={handleSubmit}>
            <h1 className="reg-title">Registration</h1>

            {error && <div className="reg-error">⚠️ {error}</div>}

            {/* ── Section 1: Your details ── */}
            <h2 className="reg-section-title">Your details</h2>
            <div className="reg-panel">
              <div className="reg-field">
                <label htmlFor="reg-fullname">Full Name</label>
                <input
                  id="reg-fullname"
                  type="text"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  placeholder=""
                  required
                />
              </div>

              <div className="reg-field">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder=""
                  required
                />
              </div>

              <div className="reg-field">
                <label htmlFor="reg-confirm-email">Confirm Email</label>
                <input
                  id="reg-confirm-email"
                  type="email"
                  value={form.confirm_email}
                  onChange={e => set('confirm_email', e.target.value)}
                  placeholder=""
                  required
                />
                {form.confirm_email.length > 0 && !emailsMatch && (
                  <span className="reg-hint reg-hint-error">Emails do not match.</span>
                )}
              </div>

              <div className="reg-field">
                <label htmlFor="reg-password">Password</label>
                <div className="reg-pwd-wrap">
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
                    className="reg-pwd-toggle"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password.length > 0 && !passwordLongEnough && (
                  <span className="reg-hint reg-hint-error">Use at least 8 characters.</span>
                )}
              </div>

              <div className="reg-field">
                <label htmlFor="reg-password-confirm">Confirm Password</label>
                <input
                  id="reg-password-confirm"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={e => set('password_confirmation', e.target.value)}
                  autoComplete="new-password"
                  required
                />
                {form.password_confirmation.length > 0 && !passwordsMatch && (
                  <span className="reg-hint reg-hint-error">Passwords do not match.</span>
                )}
              </div>

              {/* Email OTP Authentication */}
              <div className="reg-otp">
                <div className="reg-otp-head">
                  <span className="reg-otp-label">Email OTP Authentication</span>
                  {otpState === 'verified' ? (
                    <span className="reg-otp-badge verified">✓ Verified</span>
                  ) : (
                    <span className="reg-otp-badge">Required</span>
                  )}
                </div>

                {otpState === 'idle' && (
                  <button
                    type="button"
                    className="reg-btn-otp"
                    onClick={sendOtp}
                    disabled={!canSendOtp}
                  >
                    Send verification code
                  </button>
                )}

                {otpState === 'sent' && (
                  <div className="reg-otp-box">
                    <p className="reg-otp-demo">
                      📬 Demo code sent to <strong>{form.email}</strong>: <strong>{generatedCode}</strong>
                    </p>
                    <div className="reg-otp-row">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      />
                      <button type="button" className="reg-btn-verify" onClick={verifyOtp}>
                        Verify
                      </button>
                      <button type="button" className="reg-link-btn" onClick={sendOtp}>
                        Resend
                      </button>
                    </div>
                    {otpError && <span className="reg-hint reg-hint-error">{otpError}</span>}
                  </div>
                )}

                {otpState === 'verified' && (
                  <p className="reg-hint-verified">✓ Email verified successfully.</p>
                )}
              </div>
            </div>

            {/* ── Section 2: Your organisation details ── */}
            <h2 className="reg-section-title">Your organisation details</h2>
            <div className="reg-panel">
              <div className="reg-field">
                <label htmlFor="reg-orgname">Organization Name</label>
                <input
                  id="reg-orgname"
                  type="text"
                  value={form.organization_name}
                  onChange={e => set('organization_name', e.target.value)}
                  placeholder=""
                  required
                />
              </div>

              <div className="reg-field">
                <label htmlFor="reg-orgtype">Identify your organization type</label>
                <select
                  id="reg-orgtype"
                  value={form.organization_type}
                  onChange={e => set('organization_type', e.target.value)}
                  required
                >
                  <option value="">Please select...</option>
                  {ORG_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="reg-field">
                <label htmlFor="reg-country">Country</label>
                <select
                  id="reg-country"
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                  required
                >
                  <option value="">Please select...</option>
                  {COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Agreement Box (Image 5) ── */}
            <div className="reg-agreement">
              <div className="reg-agreement-head">
                <span className="reg-info-icon">ℹ</span>
                <span>
                  By registering, you agree to the{' '}
                  <a onClick={() => navigate('/coming-soon', { state: { title: 'Privacy Policy' } })}>
                    privacy policy
                  </a>{' '}
                  and to the{' '}
                  <a onClick={() => navigate('/coming-soon', { state: { title: 'Terms and Conditions' } })}>
                    terms and conditions
                  </a>.
                </span>
              </div>

              <label className="reg-check">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                />
                <span>I have read and agree to the terms and conditions of use of the service</span>
              </label>

              <label className="reg-check">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={e => setAgreePrivacy(e.target.checked)}
                />
                <span>I have read the privacy policy</span>
              </label>
            </div>

            {/* ── Submit Button (Image 5) ── */}
            <div className="reg-actions">
              <button type="submit" className="reg-btn-submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit ›'}
              </button>
            </div>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
