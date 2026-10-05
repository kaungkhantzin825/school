import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { universityAPI } from '../services/api';
import '../styles/UniversityInfoPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { isAuthenticated } from '../utils/auth';
import UniversityLogo from '../components/UniversityLogo';

const UniversityInfoPage = () => {
  const location   = useLocation();
  const navigate   = useNavigate();
  const initialUniversity = location.state?.university;

  const [university, setUniversity] = useState<any>(initialUniversity);

  useEffect(() => {
    if (!initialUniversity?.id) return;

    const fetchLatestData = async () => {
      try {
        const res = await universityAPI.getOne(initialUniversity.id);
        setUniversity(res.data);
      } catch (err) {
        console.error('Failed to fetch latest university details', err);
      }
    };

    fetchLatestData();
  }, [initialUniversity?.id]);

  useEffect(() => {
    if (!initialUniversity) navigate('/', { replace: true });
  }, [initialUniversity, navigate]);

  if (!initialUniversity) return null;

  return (
    <div className="university-info-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── MAVER Header ── */}
      <Header />

      {/* ── Content ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1.5rem' }}>
        <div className="info-card">

          {/* Banner header */}
          <div className="info-card-banner">
            <UniversityLogo logoUrl={university.logo_url} name={university.name} size={64} tile />
            <div className="uni-title-wrap">
              <h1>{university.name}</h1>
              <span className="uni-location-tag">📍 {university.location}</span>
            </div>
          </div>

          {/* Body */}
          <div className="info-card-body">
            <p className="info-description">
              {university.description ||
                `${university.name} is a recognized institution of higher learning
                 located in ${university.location}, Myanmar. The university offers
                 undergraduate, postgraduate and doctoral degree programmes and
                 maintains comprehensive alumni and graduation records available
                 for official verification through this portal.`}
            </p>

            {university.verification_notice && (
              <div className="verification-notice">
                <p>{university.verification_notice}</p>
              </div>
            )}

            <div className="info-pills">
              <span className="info-pill">✅ Officially Registered</span>
              <span className="info-pill">🔒 Secure Verification</span>
              <span className="info-pill">⚡ Instant Results</span>
            </div>

            {!isAuthenticated() && (
              <div className="info-login-note">
                🔒 Verification is for registered organisations only. You'll be asked to
                sign in so each enquiry can be recorded against your organisation.
              </div>
            )}

            <div className="info-actions">
              <button className="btn-back" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <button
                className="btn-verify"
                onClick={() => {
                  // Verification requires an account so every enquiry is
                  // attributable — send unauthenticated users to sign in first
                  // and bring them straight back to the form afterwards.
                  if (!isAuthenticated()) {
                    navigate('/login', {
                      state: { redirectTo: '/verification-form', university },
                    });
                    return;
                  }
                  navigate('/verification-form', { state: { university } });
                }}
              >
                {isAuthenticated() ? 'Verify a Credential →' : 'Sign in to Verify →'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── MAVER Footer ── */}
      <Footer />
    </div>
  );
};

export default UniversityInfoPage;
