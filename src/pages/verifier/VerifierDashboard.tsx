import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { verificationAPI } from '../../services/api';
import '../../styles/verifier/VerifierDashboard.css';

type Tab = 'dashboard' | 'verified' | 'pending';

interface LogRow {
  id: number;
  request_ref: string | null;
  searched_name: string;
  searched_father_name: string;
  searched_degree: string;
  searched_year: number;
  result: string;
  status: string;
  created_at: string;
  sla_due_at: string | null;
  university?: { name: string };
  student?: {
    id: number;
    graduate_name: string;
    father_name: string;
    gender: string;
    student_id: string;
    date_of_birth: string;
    nrc_number: string;
    degree: string;
    specialization: string;
    graduation_year: number;
  } | null;
}

const fmtDate = (d?: string) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDegree = (log: LogRow) => {
  const deg = log.student?.degree || log.searched_degree || '';
  const spec = log.student?.specialization;
  if (!spec) return deg;
  if (deg.toLowerCase().includes(spec.toLowerCase())) return deg;
  if (deg.includes('(')) return deg;
  if (deg === 'M.Med.Sc') return `${deg} (${spec})`;
  return `${deg}(${spec})`;
};

const slaStatus = (log: LogRow) => {
  if (!log.sla_due_at) return { label: 'New Request', cls: 'sla-text-new' };
  const now = Date.now();
  const created = new Date(log.created_at).getTime();
  const due = new Date(log.sla_due_at).getTime();
  const hoursSinceSubmit = (now - created) / 3_600_000;
  const daysLeft = Math.ceil((due - now) / 86_400_000);

  if (hoursSinceSubmit < 24) return { label: 'New Request', cls: 'sla-text-new' };
  if (daysLeft <= 1) return { label: `Urgent - ⏱ ${Math.max(daysLeft, 0)} day left`, cls: 'sla-text-urgent' };
  return { label: `In Process - ⏱ ${daysLeft} days left`, cls: 'sla-text-process' };
};

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

const VerifierDashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(readStoredUser);

  useEffect(() => {
    if (!localStorage.getItem('auth_token') || user?.role !== 'verifier') {
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [tab, setTab] = useState<Tab>('verified');
  const [verified, setVerified] = useState<LogRow[]>([]);
  const [pending, setPending] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const fetchVerified = async () => {
    setLoading(true);
    try {
      const res = await verificationAPI.getLogs({ status: 'success' });
      setVerified(res.data.data || res.data);
    } catch {
      setVerified([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await verificationAPI.getLogs({ status: 'pending' });
      setPending(res.data.data || res.data);
    } catch {
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  // Both counts are needed for the Dashboard tab's stat cards, so load them
  // once on mount; switching tabs afterwards refreshes just that tab.
  const mounted = useRef(false);

  useEffect(() => {
    fetchVerified();
    fetchPending();
    mounted.current = true;
  }, []);

  useEffect(() => {
    if (!mounted.current) return;
    if (tab === 'verified') fetchVerified();
    if (tab === 'pending') fetchPending();
  }, [tab]);

  const handleReview = async (log: LogRow) => {
    setReviewingId(log.id);
    try {
      const res = await verificationAPI.recheck(log.id);
      if (res.data.status === 'success') {
        alert(`✅ ${log.searched_name} has now been found and verified.`);
        fetchPending();
        fetchVerified();
      } else {
        alert(`Manual registrar review in progress for ${log.request_ref || ('#VR-' + log.id)}. No changes detected yet.`);
      }
    } catch {
      alert('Could not review this request right now. Please try again.');
    } finally {
      setReviewingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="vd-shell">
      {/* ── Topbar ── */}
      <header className="vd-topbar-wrap">
        <h1 className="vd-topbar-title">VERIFIER SIDE DASHBOARD</h1>
      </header>

      <div className="vd-body">
        {/* ── Sidebar ── */}
        <aside className="vd-sidebar">
          {/* User profile row */}
          <div className="vd-user">
            <div className="vd-avatar-circle">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="vd-user-name">{user?.name || 'Mr. Smith'}</span>
          </div>

          {/* Navigation Links */}
          <nav className="vd-nav">
            <button
              className={`vd-nav-item ${tab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setTab('dashboard')}
            >
              <span className="vd-nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </span>
              <span>Dashboard</span>
            </button>

            <button
              className={`vd-nav-item ${tab === 'verified' ? 'active' : ''}`}
              onClick={() => setTab('verified')}
            >
              <span className="vd-nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </span>
              <span>Verified Records</span>
            </button>

            <button
              className={`vd-nav-item ${tab === 'pending' ? 'active' : ''}`}
              onClick={() => setTab('pending')}
            >
              <span className="vd-nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <span>Pending Requests</span>
            </button>
          </nav>

          <button className="vd-logout-btn" onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="vd-main">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {tab === 'dashboard' && (
            <div className="vd-overview-wrap">
              <div className="vd-overview-stats">
                <div className="vd-stat-card" onClick={() => setTab('verified')} style={{ cursor: 'pointer' }}>
                  <div className="vd-stat-icon stat-green">✅</div>
                  <div>
                    <div className="vd-stat-val">{verified.length}</div>
                    <div className="vd-stat-lbl">Verified Records</div>
                  </div>
                </div>

                <div className="vd-stat-card" onClick={() => setTab('pending')} style={{ cursor: 'pointer' }}>
                  <div className="vd-stat-icon stat-amber">🕒</div>
                  <div>
                    <div className="vd-stat-val">{pending.length}</div>
                    <div className="vd-stat-lbl">Pending Requests</div>
                  </div>
                </div>

                <div className="vd-stat-card">
                  <div className="vd-stat-icon stat-blue">🏢</div>
                  <div>
                    <div className="vd-stat-val" style={{ fontSize: '1rem', wordBreak: 'break-all' }}>
                      {user?.email || 'smith@verifier.com'}
                    </div>
                    <div className="vd-stat-lbl">Signed in as Verifier</div>
                  </div>
                </div>
              </div>

              <div className="vd-overview-info">
                <h3>Welcome to your Verifier Portal</h3>
                <p>
                  As an authorized verifying organization, you can access confirmed student credentials via{' '}
                  <strong>Verified Records</strong>, and track degree searches undergoing registrar archival review in{' '}
                  <strong>Pending Requests</strong>.
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                  <button className="vd-btn-primary" onClick={() => setTab('verified')}>
                    View Verified Records →
                  </button>
                  <button className="vd-btn-secondary" onClick={() => setTab('pending')}>
                    View Pending Requests →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERIFIED RECORDS (Image 1) */}
          {tab === 'verified' && (
            <div className="vd-table-container">
              <div className="vd-action-bar">
                <button className="vd-refresh-btn" onClick={fetchVerified} disabled={loading}>
                  🔄 {loading ? 'Refreshing...' : 'Refresh Records'}
                </button>
              </div>

              <div className="vd-table-scroll">
                <table className="vd-verified-table">
                  <thead>
                    <tr>
                      <th className="col-no">No.</th>
                      <th>Graduate Name</th>
                      <th>Gender</th>
                      <th className="col-center">Graduate Reg. Number</th>
                      <th>Date of Birth</th>
                      <th>NRC Number</th>
                      <th>Degree / Specialization</th>
                      <th className="col-center">Graduation Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verified.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="vd-empty-cell">
                          No verified records found.
                        </td>
                      </tr>
                    ) : (
                      verified.map((log, idx) => (
                        <tr key={log.id}>
                          <td className="col-no">{idx + 1}</td>
                          <td className="col-bold">{log.student?.graduate_name || log.searched_name}</td>
                          <td>{log.student?.gender || '—'}</td>
                          <td className="col-center col-reg">
                            {log.student?.student_id || '—'}
                          </td>
                          <td>{fmtDate(log.student?.date_of_birth)}</td>
                          <td className="col-nrc">{log.student?.nrc_number || '—'}</td>
                          <td>{formatDegree(log)}</td>
                          <td className="col-center col-year">
                            {log.student?.graduation_year || log.searched_year}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PENDING REQUESTS (Image 2) */}
          {tab === 'pending' && (
            <div className="vd-pending-card">
              <div className="vd-pending-header">
                <h2 className="vd-pending-title">PENDING REQUESTS LIST</h2>
                <button className="vd-refresh-btn" onClick={fetchPending} disabled={loading}>
                  🔄 {loading ? 'Refreshing...' : 'Refresh Requests'}
                </button>
              </div>

              <div className="vd-table-scroll">
                <table className="vd-pending-table">
                  <thead>
                    <tr>
                      <th className="col-no">No.</th>
                      <th>Request ID</th>
                      <th>Candidate Name</th>
                      <th>Degree / Specialization</th>
                      <th>Date Submitted</th>
                      <th>SLA Status</th>
                      <th className="col-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="vd-empty-cell">
                          No pending requests at the moment.
                        </td>
                      </tr>
                    ) : (
                      pending.map((log, idx) => {
                        const sla = slaStatus(log);
                        const reqId = log.request_ref || `VR-${String(log.id).padStart(4, '0')}`;
                        const displayRef = reqId.startsWith('#') ? reqId : `#${reqId}`;
                        return (
                          <tr key={log.id}>
                            <td className="col-no">{idx + 1}</td>
                            <td className="col-ref">{displayRef}</td>
                            <td className="col-bold">{log.searched_name}</td>
                            <td>{log.searched_degree}</td>
                            <td>{fmtDate(log.created_at)}</td>
                            <td>
                              <span className={`vd-sla-text ${sla.cls}`}>{sla.label}</span>
                            </td>
                            <td className="col-center">
                              <button
                                className="vd-review-btn"
                                onClick={() => handleReview(log)}
                                disabled={reviewingId === log.id}
                              >
                                {reviewingId === log.id ? 'CHECKING...' : 'REVIEW'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VerifierDashboard;
