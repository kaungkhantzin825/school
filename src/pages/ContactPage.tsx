import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { contactAPI } from '../services/api';
import '../styles/ContactPage.css';

const COUNTRIES = [
  'Myanmar', 'Singapore', 'Thailand', 'Malaysia', 'India', 'China', 'Japan',
  'South Korea', 'United Kingdom', 'United States', 'Australia', 'Germany',
  'France', 'Canada', 'United Arab Emirates', 'Other',
];

const SUPPORT_EMAIL = 'support@acvr.edu.mm';

const emptyForm = {
  name: '',
  email: '',
  country: '',
  organization: '',
  subject: '',
  message: '',
};

/**
 * Public contact page.
 *
 * Messages are emailed to the support mailbox by the API; this form never
 * writes to the database. The checkbox is a plain speed bump — there is no
 * captcha site key for this deployment, so the server pairs it with a
 * honeypot field and a strict rate limit.
 */
const ContactPage = () => {
  const [form, setForm] = useState(emptyForm);
  const [notRobot, setNotRobot] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof emptyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!notRobot) {
      setError('Please confirm you are not a robot.');
      return;
    }

    setSending(true);
    try {
      await contactAPI.send({ ...form, not_robot: true, website: honeypot });
      setSent(true);
    } catch (err: any) {
      const fieldErrors = err.response?.data?.errors;
      const firstFieldError = fieldErrors ? Object.values(fieldErrors)[0] : null;

      setError(
        (Array.isArray(firstFieldError) ? String(firstFieldError[0]) : null) ||
        err.friendlyMessage ||
        err.response?.data?.message ||
        'We could not send your message. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setNotRobot(false);
    setSent(false);
  };

  return (
    <div className="contact-page">
      <Header />

      <main className="ct-main">
        <section className="ct-hero">
          <div className="ct-hero-inner">
            <span className="ct-eyebrow">Contact us</span>
            <h1 className="ct-title">Get in Touch</h1>
            <p className="ct-lead">
              We're here to help! Feel free to reach out to us for any questions,
              support, or partnership inquiries.
            </p>
          </div>
        </section>

        <div className="ct-body">
          {sent ? (
            <div className="ct-card ct-sent">
              <div className="ct-sent-icon">✓</div>
              <h2>Message sent</h2>
              <p>
                Thank you for getting in touch. Your message is with our support team
                and we usually reply within 2 business days.
              </p>
              <p className="ct-sent-alt">
                Need a faster answer? Email us at{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </p>
              <button type="button" className="ct-link-btn" onClick={resetForm}>
                Send another message
              </button>
            </div>
          ) : (
            <form className="ct-card" onSubmit={handleSubmit} noValidate>
              <h2 className="ct-card-title">Send Us a Message</h2>
              <p className="ct-card-sub">
                Fill in the form below and we'll get back to you as soon as possible.
              </p>

              {error && <div className="ct-error">⚠️ {error}</div>}

              <div className="ct-row">
                <div className="ct-field">
                  <label htmlFor="ct-name">Name <span>*</span></label>
                  <input
                    id="ct-name"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Your name"
                    maxLength={120}
                    required
                  />
                </div>

                <div className="ct-field">
                  <label htmlFor="ct-email">Email <span>*</span></label>
                  <input
                    id="ct-email"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="Your email address"
                    maxLength={190}
                    required
                  />
                </div>
              </div>

              <div className="ct-field">
                <label htmlFor="ct-country">Country</label>
                <select id="ct-country" value={form.country} onChange={set('country')}>
                  <option value="">Country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="ct-field">
                <label htmlFor="ct-org">Organization / Company</label>
                <input
                  id="ct-org"
                  value={form.organization}
                  onChange={set('organization')}
                  placeholder="Your organization or company name"
                  maxLength={190}
                />
              </div>

              <div className="ct-field">
                <label htmlFor="ct-subject">Subject <span>*</span></label>
                <input
                  id="ct-subject"
                  value={form.subject}
                  onChange={set('subject')}
                  placeholder="Subject"
                  maxLength={150}
                  required
                />
              </div>

              <div className="ct-field">
                <label htmlFor="ct-message">Message <span>*</span></label>
                <textarea
                  id="ct-message"
                  value={form.message}
                  onChange={set('message')}
                  placeholder="Type your message here..."
                  rows={5}
                  maxLength={5000}
                  required
                />
              </div>

              {/* Honeypot — hidden from people, irresistible to bots. */}
              <input
                type="text"
                className="ct-honeypot"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <label className="ct-robot">
                <input
                  type="checkbox"
                  checked={notRobot}
                  onChange={e => setNotRobot(e.target.checked)}
                />
                <span className="ct-robot-box" aria-hidden="true" />
                <span className="ct-robot-text">I'm not a robot</span>
                <span className="ct-robot-badge" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v3M8 5h8a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z" />
                    <circle cx="9" cy="11" r="1" />
                    <circle cx="15" cy="11" r="1" />
                    <path d="M9 15h6" />
                  </svg>
                </span>
              </label>

              <button type="submit" className="ct-submit" disabled={sending}>
                {sending ? 'Sending…' : 'Submit'}
                {!sending && (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                )}
              </button>
            </form>
          )}

          <p className="ct-alt-contact">
            Prefer email? Write to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
