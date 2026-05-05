import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verificationAPI } from '../services/api';
import axios from 'axios';
import '../styles/VerificationFormPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend.mmcertify.com/api';

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

  const [degrees, setDegrees]   = useState<Degree[]>([]);
  const [degLoading, setDegLoading] = useState(true);

  const [formData, setFormData] = useState({
    degree:           '',
    graduateName:     '',
    fatherName:       '',
    graduationYear:   '',
    verifierName:     '',
    verifierEmail:    '',
    organizationType: '',
    organizationName: '',
    notes:            '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  if (!university) { navigate('/'); return null; }

  // ── Fetch degrees for this university from the backend ──
  useEffect(() => {
    const fetchDegrees = async () => {
      setDegLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/universities/${university.id}/degrees`);
        const list: Degree[] = res.data;
        setDegrees(list);
        // Pre-select first degree
        if (list.length > 0) setFormData(prev => ({ ...prev, degree: list[0].name }));
      } catch {
        setDegrees([]);
      } finally {
        setDegLoading(false);
      }
    };
    fetchDegrees();
  }, [university.id]);

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.degree) { setError('Please select a degree.'); return; }

    setLoading(true);
    try {
      const response = await verificationAPI.verify({
        university_id:     university.id,
        graduate_name:     formData.graduateName,
        father_name:       formData.fatherName,
        degree:            formData.degree,
        graduation_year:   parseInt(formData.graduationYear),
        verifier_name:     formData.verifierName  || undefined,
        verifier_email:    formData.verifierEmail || undefined,
        organization_type: formData.organizationType || undefined,
        organization_name: formData.organizationName || undefined,
        notes:             formData.notes || undefined,
      });

      navigate('/verification-result', {
        state: {
          university,
          formData,
          isValid: response.data.verified,
          student: response.data.student,
          logId:   response.data.log_id,
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
    <div className="verification-form-page">
      <div className="form-card">

        {/* Banner */}
        <div className="form-card-banner">
          <div className="form-shield">🏛️</div>
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

          {/* Degree — dynamic from backend */}
          <div className="form-group">
            <label>Degree / Programme</label>
            {degLoading ? (
              <div style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.88rem' }}>
                ⏳ Loading degrees for this university...
              </div>
            ) : degrees.length === 0 ? (
              <div style={{
                padding: '0.75rem 1rem', background: '#fef9c3', borderRadius: '8px',
                color: '#854d0e', fontSize: '0.85rem', border: '1px solid #fde68a'
              }}>
                ⚠️ No degrees are configured for this university yet. Please contact the university admin.
              </div>
            ) : (
              <select
                className="form-control"
                value={formData.degree}
                onChange={(e) => set('degree', e.target.value)}
                required
              >
                <option value="">-- Select Degree --</option>
                {degrees.map(d => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Graduate details */}
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

          {/* Verifier info */}
          <div className="section-divider">
            <span>Verifier Information (optional)</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Your Name <span className="optional">(optional)</span></label>
              <input
                type="text"
                className="form-control"
                value={formData.verifierName}
                onChange={(e) => set('verifierName', e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="form-group">
              <label>Your Email <span className="optional">(optional)</span></label>
              <input
                type="email"
                className="form-control"
                value={formData.verifierEmail}
                onChange={(e) => set('verifierEmail', e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Organization Type <span className="optional">(optional)</span></label>
              <select
                className="form-control"
                value={formData.organizationType}
                onChange={(e) => set('organizationType', e.target.value)}
              >
                <option value="">-- Select --</option>
                <option>Employer / Company</option>
                <option>Recruitment Agency</option>
                <option>Government Body</option>
                <option>University / Institution</option>
                <option>Embassy / Consulate</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Organization Name <span className="optional">(optional)</span></label>
              <input
                type="text"
                className="form-control"
                value={formData.organizationName}
                onChange={(e) => set('organizationName', e.target.value)}
                placeholder="e.g. ABC Company Ltd."
              />
            </div>
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
  );
};

export default VerificationFormPage;
