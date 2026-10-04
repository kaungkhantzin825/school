import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/VerificationResultPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StudentPhoto from '../components/StudentPhoto';

const VerificationResultPage = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { university, formData, isValid, isPending, student, requestRef, slaDueAt } = location.state || {};

  useEffect(() => {
    if (!university) navigate('/', { replace: true });
  }, [university, navigate]);

  if (!university) return null;

  const genderBadge = (gender: string) =>
    gender?.toLowerCase() === 'female' ? 'td-badge td-badge-female' : 'td-badge td-badge-male';

  const bannerCls = isValid ? 'success-banner' : isPending ? 'pending-banner' : 'error-banner';
  const bannerIcon = isValid ? '✅' : isPending ? '🕐' : '❌';

  return (
    <div className="result-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── MAVER Header ── */}
      <Header />

      {/* ── Content ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1.5rem' }}>
        <div className="result-card">

          {/* Banner */}
          <div className={`result-banner ${bannerCls}`}>
            <div className="result-banner-icon">
              {bannerIcon}
            </div>
            <div className="result-banner-text">
              <h2>{university.name}</h2>
              <p>📍 {university.location}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="result-steps">
            <div className="r-step">
              <span className="r-step-num done">✓</span>
              <span className="r-step-label done">Select</span>
            </div>
            <div className="r-step-connector done" />
            <div className="r-step">
              <span className="r-step-num done">✓</span>
              <span className="r-step-label done">Fill Form</span>
            </div>
            <div className="r-step-connector done" />
            <div className="r-step">
              <span className={`r-step-num ${isValid ? 'done' : 'active'}`}>
                {isValid ? '✓' : '3'}
              </span>
              <span className={`r-step-label ${isValid ? 'done' : ''}`}>Result</span>
            </div>
          </div>

          {/* Body */}
          <div className="result-body">

            {isPending ? (
              /* Pending manual review */
              <div className="pending-hero">
                <div className="pending-seal">🕐</div>
                <h3>Manual Verification In Progress</h3>
                <p>
                  <strong>{formData?.graduateName}</strong>'s record falls outside the instant-lookup
                  window, so it has been queued for manual review by <strong>{university.name}</strong>'s
                  registrar team.
                </p>
                {requestRef && (
                  <div className="pending-ref">
                    Request ID <strong>{requestRef}</strong>
                  </div>
                )}
                <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  {slaDueAt
                    ? `Expected completion by ${new Date(slaDueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (typically 2–5 business days).`
                    : 'This typically takes 2–5 business days.'}
                  {' '}If you registered an account, you can track this under{' '}
                  <strong>Pending Requests</strong> on your Verifier Dashboard.
                </p>
              </div>
            ) : isValid ? (
              <>
                {/* Verified hero */}
                <div className="verified-hero">
                  <div className="verified-seal">✓</div>
                  <div className="verified-text">
                    <h3>Credential Verified Successfully</h3>
                    <p>
                      This academic credential has been confirmed in our official records.
                      The information below was retrieved from the university's verified database.
                    </p>
                  </div>
                </div>

                {/* Graduate photo */}
                <div className="graduate-section">
                  <div className="graduate-photo-wrap">
                    <StudentPhoto
                      photoUrl={student?.photo_url}
                      name={student?.graduate_name || formData?.graduateName}
                      size={96}
                      square
                    />
                  </div>
                  <div className="graduate-caption">
                    <strong>{student?.graduate_name || formData?.graduateName}</strong>
                    <span>{student?.degree || formData?.degree}</span>
                  </div>
                </div>

                {/* Result table */}
                <div className="result-table-wrap">
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Graduate Name</th>
                        <th>Gender</th>
                        <th>Student ID</th>
                        <th>Date of Birth</th>
                        <th>NRC Number</th>
                        <th>Degree / Specialization</th>
                        <th>Graduation Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td className="td-name">
                          {student?.graduate_name || formData?.graduateName}
                        </td>
                        <td>
                          <span className={genderBadge(student?.gender || 'Male')}>
                            {student?.gender || '—'}
                          </span>
                        </td>
                        <td>{student?.student_id || '—'}</td>
                        <td>
                          {student?.date_of_birth
                            ? new Date(student.date_of_birth).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })
                            : '—'}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                          {student?.nrc_number || '—'}
                        </td>
                        <td>
                          {student?.degree || formData?.degree}
                          {student?.specialization && (
                            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.78rem' }}>
                              {student.specialization}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="td-badge td-badge-success">
                            {student?.graduation_year || formData?.graduationYear}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              /* Invalid */
              <div className="invalid-hero">
                <div className="invalid-seal">✕</div>
                <h3>Credential Not Found</h3>
                <p>
                  We could not find a matching record for <strong>{formData?.graduateName}</strong> in
                  the <strong>{university.name}</strong> database. Please double-check the details
                  (name spelling, degree, graduation year) and try again.
                </p>
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  If you believe this is an error, please contact the university directly or email:
                </p>
                <span className="contact-email">📧 verification@{university.name?.toLowerCase().replace(/\s+/g, '')}.edu.mm</span>
              </div>
            )}

            {/* Actions */}
            <div className="result-actions">
              <button className="btn-home" onClick={() => navigate('/')}>
                🏠 Home
              </button>
              {isValid && (
                <button className="btn-print" onClick={() => window.print()}>
                  🖨️ Print
                </button>
              )}
              <button
                className="btn-verify-another"
                onClick={() => navigate('/verification-form', { state: { university } })}
              >
                🔍 Verify Another →
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

export default VerificationResultPage;
