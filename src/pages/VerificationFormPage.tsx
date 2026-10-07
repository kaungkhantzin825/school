import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verificationAPI, degreeAPI } from '../services/api';
import '../styles/VerificationFormPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { isAuthenticated } from '../utils/auth';
import UniversityLogo from '../components/UniversityLogo';

interface Degree {
  id: number;
  name: string;
  code: string;
  level: string;
}

const VerificationFormPage = () => {
  const location   = useLocation();
  const navigate   = useNavigate();
  const university = location.state?.university;

  const [degrees,    setDegrees]    = useState<Degree[]>([]);
  const [degLoading, setDegLoading] = useState(true);

  const [formData, setFormData] = useState({
    degree:           '',
    graduateName:     '',
    fatherName:       '',
    graduationYear:   '',
    notes:            '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Redirecting has to happen in an effect, not during render: calling
  // navigate() while rendering warns, and an early return here would skip the
  // hooks below and break the rules of hooks on the next render.
  useEffect(() => {
    if (!university) {
      navigate('/', { replace: true });
      return;
    }
    // Guard the page itself, not just the button that leads here — otherwise
    // the URL could be opened directly and produce an anonymous enquiry.
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { redirectTo: '/verification-form', university } });
    }
  }, [university, navigate]);

  useEffect(() => {
    if (!university) return;

    const fetchDegrees = async () => {
      setDegLoading(true);
      try {
        const res = await degreeAPI.getByUniversity(university.id);
        const list: Degree[] = res.data;
        setDegrees(list);
        if (list.length > 0) {
          setFormData(prev => ({ ...prev, degree: list[0].name }));
        }
      } catch {
        setDegrees([]);
      } finally {
        setDegLoading(false);
      }
    };
    fetchDegrees();
  }, [university]);

  if (!university || !isAuthenticated()) return null;

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await verificationAPI.verify({
        university_id:     university.id,
        graduate_name:     formData.graduateName,
        father_name:       formData.fatherName,
        degree:            formData.degree,
        graduation_year:   parseInt(formData.graduationYear),
        // Verifier identity is taken from the signed-in account on the server,
        // so it can't be typed in (or faked) here any more.
        notes:             formData.notes || undefined,
      });

      navigate('/verification-result', {
        state: {
          university,
          formData,
          isValid:    response.data.verified,
          isPending:  response.data.status === 'pending',
          student:    response.data.student,
          logId:      response.data.log_id,
          requestRef: response.data.request_ref,
          slaDueAt:   response.data.sla_due_at,
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'An error occurred during verification. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-form-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── MAVER Header ── */}
      <Header />

      {/* ── Content ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1.5rem' }}>
        <div className="form-card">

          {/* Banner */}
          <div className="form-card-banner">
            <UniversityLogo logoUrl={university.logo_url} name={university.name} size={52} tile />
            <div className="form-banner-text">
              <h2>{university.name}</h2>
              <p>📍 {university.location}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="form-steps">
            <div className="step">
              <span className="step-num done">✓</span>
              <span className="step-label done">Select</span>
            </div>
            <div className="step-connector done" />
            <div className="step">
              <span className="step-num active">2</span>
              <span className="step-label active">Fill Form</span>
            </div>
            <div className="step-connector" />
            <div className="step">
              <span className="step-num">3</span>
              <span className="step-label">Result</span>
            </div>
          </div>

          {/* Form */}
          <form className="form-body" onSubmit={handleSubmit}>

            {error && (
              <div style={{
                background: '#fee2e2', color: '#dc2626', borderRadius: '10px',
                padding: '0.75rem 1rem', fontSize: '0.88rem', marginBottom: '1.25rem'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Degree */}
            <div className="form-group">
              <label>Degree / Programme</label>
              {degLoading ? (
                <select className="form-control" disabled>
                  <option>Loading degrees...</option>
                </select>
              ) : degrees.length === 0 ? (
                <select className="form-control" disabled>
                  <option>No degrees configured for this university</option>
                </select>
              ) : (
                <select
                  className="form-control"
                  value={formData.degree}
                  onChange={(e) => set('degree', e.target.value)}
                  required
                >
                  {degrees.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Graduate's Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.graduateName}
                  onChange={(e) => set('graduateName', e.target.value)}
                  placeholder="e.g. Maung Maung"
                  required
                />
              </div>
              <div className="form-group">
                <label>Father's Name <span className="optional">(on certificate)</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.fatherName}
                  onChange={(e) => set('fatherName', e.target.value)}
                  placeholder="e.g. U Kyaw Zin"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Year of Graduation</label>
              <input
                type="number"
                className="form-control"
                value={formData.graduationYear}
                onChange={(e) => set('graduationYear', e.target.value)}
                placeholder="e.g. 2023"
                min="1950"
                max={new Date().getFullYear() + 2}
                required
              />
            </div>

            <div className="form-group">
              <label>Additional Notes <span className="optional">(optional)</span></label>
              <textarea
                className="form-control"
                value={formData.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Any extra details to help with the enquiry..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-back-sm" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading || degLoading || degrees.length === 0}
              >
                {loading ? (
                  <><div className="submit-spinner" /> Verifying...</>
                ) : (
                  '🔍 Submit Verification'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── MAVER Footer ── */}
      <Footer />
    </div>
  );
};

export default VerificationFormPage;
