import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/UniversityInfoPage.css';

const UniversityInfoPage = () => {
  const location   = useLocation();
  const navigate   = useNavigate();
  const university = location.state?.university;

  if (!university) {
    navigate('/');
    return null;
  }

  return (
    <div className="university-info-page">
      <div className="info-card">

        {/* Banner header */}
        <div className="info-card-banner">
          {university.logo_url ? (
            <img src={university.logo_url} alt="Logo" className="uni-shield" style={{ background: '#fff', objectFit: 'contain' }} />
          ) : (
            <div className="uni-shield">🏛️</div>
          )}
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

          <div className="info-pills">
            <span className="info-pill">✅ Officially Registered</span>
            <span className="info-pill">🔒 Secure Verification</span>
            <span className="info-pill">⚡ Instant Results</span>
          </div>

          <div className="info-actions">
            <button className="btn-back" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <button
              className="btn-verify"
              onClick={() => navigate('/verification-form', { state: { university } })}
            >
              Verify a Credential →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UniversityInfoPage;
