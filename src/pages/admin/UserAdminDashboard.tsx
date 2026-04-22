import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI, verificationAPI, degreeAPI } from '../../services/api';
import '../../styles/admin/UserAdminDashboard.css';

type Tab = 'upload' | 'students' | 'logs' | 'degree' | 'addstudent';

interface Student {
  id: number;
  graduate_name: string;
  father_name: string;
  gender: string;
  date_of_birth: string;
  nrc_number: string;
  student_id: string;
  degree: string;
  specialization: string;
  graduation_year: number;
}

interface Log {
  id: number;
  created_at: string;
  verifier_name: string;
  organization_type: string;
  organization_name: string;
  searched_name: string;
  searched_degree: string;
  result: string;
  status: string;
}

const PAGE_SIZE = 10;

const UserAdminDashboard = () => {
  const navigate = useNavigate();
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const [tab,     setTab]     = useState<Tab>('upload');
  const [students, setStudents] = useState<Student[]>([]);
  const [logs,     setLogs]     = useState<Log[]>([]);
  const [degrees,  setDegrees]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);

  /* Upload */
  const [dragOver,       setDragOver]       = useState(false);
  const [uploadedFile,   setUploadedFile]   = useState<File | null>(null);
  const [uploadPreview,  setUploadPreview]  = useState<any[]>([]);
  const [uploading,      setUploading]      = useState(false);
  const [uploadResult,   setUploadResult]   = useState<{ inserted: number; errors: any[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Students pagination + search */
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage,   setStudentPage]   = useState(1);

  /* Logs filters */
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [logPage,   setLogPage]   = useState(1);

  /* Degree Management */
  const [degreeModal, setDegreeModal] = useState(false);
  const [editDegree, setEditDegree] = useState<any>(null);
  const [degreeForm, setDegreeForm] = useState({ name: '', description: '', code: '', level: 'bachelor', status: 'active' });
  const [degreeSubmitting, setDegreeSubmitting] = useState(false);

  const setDF = (k: string, v: string) => setDegreeForm(p => ({ ...p, [k]: v }));

  const openAddDegree = () => { setEditDegree(null); setDegreeForm({ name: '', description: '', code: '', level: 'bachelor', status: 'active' }); setDegreeModal(true); };
  const openEditDegree = (d: any) => { setEditDegree(d); setDegreeForm({ name: d.name, description: d.description || '', code: d.code || '', level: d.level || 'bachelor', status: d.status || 'active' }); setDegreeModal(true); };

  const saveDegree = async () => {
    if (!degreeForm.name.trim()) { alert('Degree name is required'); return; }
    if (!user?.university_id) { alert('University ID not found'); return; }
    setDegreeSubmitting(true);
    try {
      const payload = { ...degreeForm, university_id: user.university_id };
      if (editDegree) await degreeAPI.update(editDegree.id, payload);
      else await degreeAPI.create(payload);
      setDegreeModal(false);
      fetchDegrees();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to save degree');
    } finally {
      setDegreeSubmitting(false);
    }
  };

  const deleteDegree = async (id: number) => {
    if (!confirm('Delete this degree?')) return;
    try {
      await degreeAPI.delete(id);
      fetchDegrees();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to delete degree');
    }
  };

  /* Add Student Manually */
  const [studentForm, setStudentForm] = useState({
    graduate_name: '',
    father_name: '',
    gender: 'Male',
    date_of_birth: '',
    nrc_number: '',
    student_id: '',
    degree: '',
    specialization: '',
    graduation_year: new Date().getFullYear(),
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const setSF = (k: string, v: string | number) => setStudentForm(p => ({ ...p, [k]: v }));

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.university_id) { alert('University ID not found'); return; }
    setSubmitting(true);
    setSubmitSuccess(false);
    try {
      await studentAPI.create({ ...studentForm, university_id: user.university_id });
      setSubmitSuccess(true);
      setStudentForm({
        graduate_name: '',
        father_name: '',
        gender: 'Male',
        date_of_birth: '',
        nrc_number: '',
        student_id: '',
        degree: '',
        specialization: '',
        graduation_year: new Date().getFullYear(),
      });
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (tab === 'students')   fetchStudents();
    if (tab === 'logs')       fetchLogs();
    if (tab === 'degree')     fetchDegrees();
    if (tab === 'addstudent') { fetchDegrees(); setSubmitSuccess(false); }
  }, [tab]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (user?.university_id) params.university_id = user.university_id;
      const res = await studentAPI.getAll(params);
      setStudents(res.data.data || res.data);
    } catch { setStudents(DEMO_STUDENTS); }
    finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (user?.university_id) params.university_id = user.university_id;
      const res = await verificationAPI.getLogs(params);
      setLogs(res.data.data || res.data);
    } catch { setLogs(DEMO_LOGS); }
    finally { setLoading(false); }
  };

  const fetchDegrees = async () => {
    setLoading(true);
    try {
      const res = await degreeAPI.getAll();
      setDegrees(res.data.data || res.data);
    } catch { setDegrees([]); }
    finally { setLoading(false); }
  };

  /* ── File upload ── */
  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g,'_'));
    return lines.slice(1).map(line => {
      const vals = line.split(',');
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = vals[i]?.trim() || ''; });
      return obj;
    });
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) { alert('Please upload a CSV file.'); return; }
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target?.result as string);
      setUploadPreview(rows.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!uploadedFile || !user?.university_id) return;
    setUploading(true);
    try {
      const text = await uploadedFile.text();
      const rows = parseCSV(text);
      const students = rows.map(r => ({
        graduate_name:   r.graduate_name   || r.name || '',
        father_name:     r.father_name     || r.father || '',
        gender:          r.gender          || 'Male',
        date_of_birth:   r.date_of_birth   || r.dob || '2000-01-01',
        nrc_number:      r.nrc_number      || r.nrc || '',
        degree:          r.degree          || '',
        specialization:  r.specialization  || '',
        graduation_year: parseInt(r.graduation_year || r.year || '2020'),
        student_id:      r.student_id      || r.id || '',
      }));
      const res = await studentAPI.bulkUpload(user.university_id, students);
      setUploadResult(res.data);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Upload failed. Please check your CSV format.');
    } finally {
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setUploadPreview([]);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* Derived data */
  const filteredStudents = students.filter(s =>
    `${s.graduate_name} ${s.nrc_number} ${s.degree}`.toLowerCase().includes(studentSearch.toLowerCase())
  );
  const stuPages        = Math.ceil(filteredStudents.length / PAGE_SIZE);
  const stuPaged        = filteredStudents.slice((studentPage - 1) * PAGE_SIZE, studentPage * PAGE_SIZE);

  const filteredLogs = logs.filter(l => {
    const matchStatus = logFilter === 'all' || l.status === logFilter;
    const matchSearch = `${l.searched_name} ${l.verifier_name} ${l.organization_name}`.toLowerCase().includes(logSearch.toLowerCase());
    return matchStatus && matchSearch;
  });
  const logPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const logPaged = filteredLogs.slice((logPage - 1) * PAGE_SIZE, logPage * PAGE_SIZE);

  const totalVerified  = logs.filter(l => l.status === 'success').length;
  const totalFailed    = logs.filter(l => l.status === 'failed').length;
  const initials       = (name: string) => name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0,2) || 'UA';

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="user-dashboard">
      {/* ── Sidebar ── */}
      <aside className="ud-sidebar">
        <div className="ud-logo">
          <div className="ud-logo-icon">🏛️</div>
          <div className="ud-logo-uni">{user?.university?.name || 'University Portal'}</div>
          <div className="ud-logo-sub">Admin Dashboard</div>
        </div>

        <nav className="ud-nav">
          {([
            ['upload',     '📁', 'Data Upload'],
            ['students',   '👨‍🎓', 'All Students'],
            ['logs',       '📋', 'Activity Logs'],
            ['degree',     '🎓', 'Degree'],
            ['addstudent', '➕', 'Add Student Manually'],
          ] as [Tab, string, string][]).map(([id, icon, label]) => (
            <button
              key={id}
              className={`ud-nav-item ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="ud-sidebar-footer">
          <div className="ud-user-mini">
            <div className="ud-avatar">{initials(user?.name || 'UA')}</div>
            <div>
              <div className="ud-user-name">{user?.name || 'Admin'}</div>
              <div className="ud-user-email">{user?.email || ''}</div>
            </div>
          </div>
          <button className="ud-logout" onClick={handleLogout}>🚪 Sign Out</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ud-main">
        {/* Topbar */}
        <div className="ud-topbar">
          <span className="ud-topbar-title">
            {tab === 'upload'     && '📁 Data Upload'}
            {tab === 'students'   && '👨‍🎓 All Students'}
            {tab === 'logs'       && '📋 Verifier Activity Logs'}
            {tab === 'degree'     && '🎓 Degree Management'}
            {tab === 'addstudent' && '➕ Add Student Manually'}
          </span>
          <div className="ud-topbar-right">
            <button className="ud-icon-btn" onClick={() => { if (tab === 'students') fetchStudents(); if (tab === 'logs') fetchLogs(); if (tab === 'degree') fetchDegrees(); }} title="Refresh">🔄</button>
          </div>
        </div>

        <div className="ud-content">

          {/* ── UPLOAD TAB ── */}
          {tab === 'upload' && (
            <>
              {/* Quick stats */}
              <div className="ud-stats">
                <div className="ud-stat">
                  <div className="ud-stat-icon" style={{ background: '#dbeafe' }}>📁</div>
                  <div>
                    <div className="ud-stat-val">{students.length || '—'}</div>
                    <div className="ud-stat-lbl">Total Records</div>
                  </div>
                </div>
                <div className="ud-stat">
                  <div className="ud-stat-icon" style={{ background: '#d1fae5' }}>✅</div>
                  <div>
                    <div className="ud-stat-val">{totalVerified}</div>
                    <div className="ud-stat-lbl">Verified Requests</div>
                  </div>
                </div>
                <div className="ud-stat">
                  <div className="ud-stat-icon" style={{ background: '#fee2e2' }}>❌</div>
                  <div>
                    <div className="ud-stat-val">{totalFailed}</div>
                    <div className="ud-stat-lbl">Failed Requests</div>
                  </div>
                </div>
              </div>

              {/* Upload result */}
              {uploadResult && (
                <div className="upload-result">
                  <span className="upload-result-icon">✅</span>
                  <div className="upload-result-info">
                    <strong>Upload Complete — {uploadResult.inserted} records inserted</strong>
                    <span>
                      {uploadResult.errors.length > 0
                        ? `⚠️ ${uploadResult.errors.length} rows had errors`
                        : '✓ No errors'}
                    </span>
                  </div>
                  <button className="upload-result-clear" onClick={clearUpload}>Clear</button>
                </div>
              )}

              {/* Drop zone */}
              {!uploadedFile ? (
                <div
                  className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="upload-zone-icon">📂</span>
                  <h3>Drop your CSV file here</h3>
                  <p>or click to browse files. Accepts <code>.csv</code> format only.</p>
                  <button className="upload-browse-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    📁 Browse File
                  </button>
                  <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileInput} style={{ display: 'none' }} />
                </div>
              ) : (
                <div className="section-card">
                  <div className="section-card-header">
                    <div>
                      <div className="sc-title">📄 {uploadedFile.name}</div>
                      <div className="sc-sub">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                        {uploadPreview.length > 0 && ` · Preview of first ${uploadPreview.length} rows`}
                      </div>
                    </div>
                    <button className="upload-result-clear" onClick={clearUpload}>✕ Clear</button>
                  </div>

                  {uploadPreview.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="ud-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            {Object.keys(uploadPreview[0]).map(k => <th key={k}>{k}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {uploadPreview.map((row, i) => (
                            <tr key={i}>
                              {Object.values(row).map((v: any, j) => <td key={j}>{v}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button className="upload-result-clear" onClick={clearUpload}>Cancel</button>
                    <button className="upload-browse-btn" onClick={handleUploadSubmit} disabled={uploading}>
                      {uploading ? '⏳ Uploading...' : '⬆️ Upload to Database'}
                    </button>
                  </div>
                </div>
              )}

              {/* CSV format guide */}
              <div className="section-card" style={{ marginTop: '1.5rem' }}>
                <div className="section-card-header">
                  <div>
                    <div className="sc-title">📋 CSV Format Guide</div>
                    <div className="sc-sub">Required columns for bulk student upload</div>
                  </div>
                </div>
                <div className="section-card-body" style={{ overflowX: 'auto' }}>
                  <table className="ud-table">
                    <thead>
                      <tr>
                        <th>Column</th><th>Required</th><th>Example</th><th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['graduate_name', '✅ Yes', 'Maung Maung', 'Full name as on certificate'],
                        ['father_name',   '✅ Yes', 'U Kyaw Zin',   'Father name as on certificate'],
                        ['gender',        '✅ Yes', 'Male / Female', 'Exact match required'],
                        ['date_of_birth', '✅ Yes', '2000-05-15',   'YYYY-MM-DD format'],
                        ['nrc_number',    '✅ Yes', '12/OUKAMA(N)123456', 'Must be unique'],
                        ['degree',        '✅ Yes', 'B.E(Civil)',    'Degree name'],
                        ['graduation_year','✅ Yes','2023',          '4-digit year'],
                        ['student_id',    '⬜ No',  'CS-2019-001',  'Optional student ID'],
                        ['specialization','⬜ No',  'Structural Engineering', 'Optional specialization'],
                      ].map(([col, req, ex, note]) => (
                        <tr key={col}>
                          <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{col}</code></td>
                          <td>{req}</td>
                          <td style={{ color: '#64748b', fontStyle: 'italic' }}>{ex}</td>
                          <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── STUDENTS TAB ── */}
          {tab === 'students' && (
            <div className="ud-table-card">
              <div className="ud-table-header">
                <div>
                  <div className="ud-table-title">All Student Records</div>
                  <div className="ud-table-meta">{filteredStudents.length} students total</div>
                </div>
                <div className="filter-bar">
                  <div className="filter-search">
                    <span>🔍</span>
                    <input
                      placeholder="Search name, NRC, degree..."
                      value={studentSearch}
                      onChange={e => { setStudentSearch(e.target.value); setStudentPage(1); }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="ud-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Graduate Name</th>
                      <th>Gender</th>
                      <th>Date of Birth</th>
                      <th>NRC Number</th>
                      <th>Degree</th>
                      <th>Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading students...</td></tr>
                    ) : stuPaged.length === 0 ? (
                      <tr><td colSpan={7}>
                        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', color: '#94a3b8', textAlign: 'center' }}>
                          <span style={{ fontSize: '3rem' }}>👨‍🎓</span>
                          <p>No students found. {studentSearch ? 'Try a different search.' : 'Upload a CSV to get started.'}</p>
                        </div>
                      </td></tr>
                    ) : stuPaged.map((s, i) => (
                      <tr key={s.id || i}>
                        <td>{(studentPage - 1) * PAGE_SIZE + i + 1}</td>
                        <td className="td-name">
                          {s.graduate_name}
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>
                            {s.student_id || ''}
                          </span>
                        </td>
                        <td>
                          <span className={`gender-pill ${s.gender?.toLowerCase() === 'female' ? 'gender-female' : 'gender-male'}`}>
                            {s.gender?.toLowerCase() === 'female' ? '♀' : '♂'} {s.gender}
                          </span>
                        </td>
                        <td>
                          {s.date_of_birth
                            ? new Date(s.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="td-mono">{s.nrc_number}</td>
                        <td>
                          {s.degree}
                          {s.specialization && <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>{s.specialization}</span>}
                        </td>
                        <td>
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 600 }}>
                            {s.graduation_year}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {stuPages > 1 && (
                <div className="ud-pagination">
                  <span>Showing {(studentPage - 1) * PAGE_SIZE + 1}–{Math.min(studentPage * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length}</span>
                  <div className="pagination-btns">
                    <button className="page-btn" onClick={() => setStudentPage(p => Math.max(1, p - 1))} disabled={studentPage === 1}>‹</button>
                    {Array.from({ length: Math.min(stuPages, 5) }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`page-btn ${p === studentPage ? 'active' : ''}`} onClick={() => setStudentPage(p)}>{p}</button>
                    ))}
                    <button className="page-btn" onClick={() => setStudentPage(p => Math.min(stuPages, p + 1))} disabled={studentPage === stuPages}>›</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── LOGS TAB ── */}
          {tab === 'logs' && (
            <div className="ud-table-card">
              <div className="ud-table-header">
                <div>
                  <div className="ud-table-title">Verifier Activity Logs</div>
                  <div className="ud-table-meta">{filteredLogs.length} records</div>
                </div>
                <div className="filter-bar">
                  <select className="filter-select" value={logFilter} onChange={e => { setLogFilter(e.target.value); setLogPage(1); }}>
                    <option value="all">All Status</option>
                    <option value="success">✅ Success</option>
                    <option value="failed">❌ Failed</option>
                  </select>
                  <div className="filter-search">
                    <span>🔍</span>
                    <input
                      placeholder="Search name or org..."
                      value={logSearch}
                      onChange={e => { setLogSearch(e.target.value); setLogPage(1); }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="ud-table">
                  <thead>
                    <tr>
                      <th>Date &amp; Time</th>
                      <th>Verifier</th>
                      <th>Organization</th>
                      <th>Student Name</th>
                      <th>Degree</th>
                      <th>Year</th>
                      <th>Result</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading logs...</td></tr>
                    ) : logPaged.length === 0 ? (
                      <tr><td colSpan={8}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', color: '#94a3b8', textAlign: 'center' }}>
                          <span style={{ fontSize: '3rem' }}>📋</span>
                          <p>No activity logs found.</p>
                        </div>
                      </td></tr>
                    ) : logPaged.map((l, i) => (
                      <tr key={l.id || i}>
                        <td style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(l.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="log-highlight">{l.verifier_name || 'Anonymous'}</td>
                        <td className="log-highlight">
                          {l.organization_name || '—'}
                          {l.organization_type && <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>{l.organization_type}</span>}
                        </td>
                        <td className="td-name">{l.searched_name}</td>
                        <td style={{ fontSize: '0.82rem' }}>{l.searched_degree}</td>
                        <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{(l as any).searched_year || '—'}</td>
                        <td style={{ fontSize: '0.82rem' }}>{l.result?.replace('_', ' ')}</td>
                        <td>
                          <span className={`log-status ${l.status === 'success' ? 'log-success' : 'log-failed'}`}>
                            {l.status === 'success' ? '✅ Success' : '❌ Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {logPages > 1 && (
                <div className="ud-pagination">
                  <span>Showing {(logPage - 1) * PAGE_SIZE + 1}–{Math.min(logPage * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length}</span>
                  <div className="pagination-btns">
                    <button className="page-btn" onClick={() => setLogPage(p => Math.max(1, p - 1))} disabled={logPage === 1}>‹</button>
                    {Array.from({ length: Math.min(logPages, 5) }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`page-btn ${p === logPage ? 'active' : ''}`} onClick={() => setLogPage(p)}>{p}</button>
                    ))}
                    <button className="page-btn" onClick={() => setLogPage(p => Math.min(logPages, p + 1))} disabled={logPage === logPages}>›</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DEGREE TAB (Degree Management) ── */}
          {tab === 'degree' && (
            <div className="ud-table-card">
              <div className="ud-table-header">
                <div>
                  <div className="ud-table-title">Degree Management</div>
                  <div className="ud-table-meta">{degrees.length} degrees</div>
                </div>
                <button className="btn-add" onClick={openAddDegree} style={{ background: '#10b981', color: 'white', padding: '0.625rem 1.25rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                  ＋ Add Degree
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="ud-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Degree Name</th>
                      <th>Code</th>
                      <th>Level</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading degrees...</td></tr>
                    ) : degrees.length === 0 ? (
                      <tr><td colSpan={6}>
                        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', color: '#94a3b8', textAlign: 'center' }}>
                          <span style={{ fontSize: '3rem' }}>🎓</span>
                          <p>No degrees found. Click "Add Degree" to create one.</p>
                        </div>
                      </td></tr>
                    ) : degrees.map((d, i) => (
                      <tr key={d.id || i}>
                        <td>{i + 1}</td>
                        <td className="td-name" style={{ fontWeight: 600, color: '#1e293b' }}>{d.name}</td>
                        <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{d.code}</code></td>
                        <td>
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize' }}>
                            {d.level}
                          </span>
                        </td>
                        <td style={{ color: '#64748b' }}>{d.description || '—'}</td>
                        <td>
                          <button 
                            className="action-btn action-edit" 
                            onClick={() => openEditDegree(d)}
                            style={{ background: '#3b82f6', color: 'white', padding: '0.375rem 0.75rem', borderRadius: '6px', border: 'none', marginRight: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="action-btn action-delete" 
                            onClick={() => deleteDegree(d.id)}
                            style={{ background: '#ef4444', color: 'white', padding: '0.375rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ADD STUDENT MANUALLY TAB ── */}
          {tab === 'addstudent' && (
            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <div className="sc-title">🎓 Add Student Manually</div>
                  <div className="sc-sub">Enter individual student information</div>
                </div>
              </div>

              {submitSuccess && (
                <div className="upload-result" style={{ margin: '1.5rem' }}>
                  <span className="upload-result-icon">✅</span>
                  <div className="upload-result-info">
                    <strong>Student Added Successfully!</strong>
                    <span>The student record has been saved to the database.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleManualSubmit} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                  
                  {/* Graduate Name */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Graduate Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="modal-input"
                      value={studentForm.graduate_name}
                      onChange={e => setSF('graduate_name', e.target.value)}
                      placeholder="e.g. Maung Maung Aye"
                      required
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>

                  {/* Father Name */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Father Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="modal-input"
                      value={studentForm.father_name}
                      onChange={e => setSF('father_name', e.target.value)}
                      placeholder="e.g. U Kyaw Zin"
                      required
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>

                  {/* Gender */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Gender <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      className="modal-input"
                      value={studentForm.gender}
                      onChange={e => setSF('gender', e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Date of Birth <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      className="modal-input"
                      value={studentForm.date_of_birth}
                      onChange={e => setSF('date_of_birth', e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>

                  {/* NRC Number */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      NRC Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="modal-input"
                      value={studentForm.nrc_number}
                      onChange={e => setSF('nrc_number', e.target.value)}
                      placeholder="e.g. 12/OUKAMA(N)123456"
                      required
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>

                  {/* Student ID */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Student ID
                    </label>
                    <input
                      type="text"
                      className="modal-input"
                      value={studentForm.student_id}
                      onChange={e => setSF('student_id', e.target.value)}
                      placeholder="e.g. CS-2019-001"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>

                  {/* Degree */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Degree <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      className="modal-input"
                      value={studentForm.degree}
                      onChange={e => setSF('degree', e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                    >
                      <option value="">-- Select Degree --</option>
                      {degrees.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    {degrees.length === 0 && (
                      <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.75rem', color: '#ef4444' }}>
                        ⚠️ No degrees available. Please add degrees first in the "Degree" menu.
                      </span>
                    )}
                  </div>

                  {/* Graduation Year */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Graduation Year <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      className="modal-input"
                      value={studentForm.graduation_year}
                      onChange={e => setSF('graduation_year', parseInt(e.target.value))}
                      placeholder="e.g. 2023"
                      min="1950"
                      max="2100"
                      required
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>

                  {/* Specialization */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Specialization
                    </label>
                    <input
                      type="text"
                      className="modal-input"
                      value={studentForm.specialization}
                      onChange={e => setSF('specialization', e.target.value)}
                      placeholder="e.g. Structural Engineering (Optional)"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="upload-result-clear"
                    onClick={() => {
                      setStudentForm({
                        graduate_name: '',
                        father_name: '',
                        gender: 'Male',
                        date_of_birth: '',
                        nrc_number: '',
                        student_id: '',
                        degree: '',
                        specialization: '',
                        graduation_year: new Date().getFullYear(),
                      });
                    }}
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    className="upload-browse-btn"
                    disabled={submitting}
                  >
                    {submitting ? '⏳ Saving...' : '💾 Save Student'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* ── Degree Modal ── */}
      {degreeModal && (
        <div className="modal-overlay" onClick={() => setDegreeModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div className="modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                {editDegree ? '✏️ Edit Degree' : '＋ Add Degree'}
              </span>
              <button className="modal-close" onClick={() => setDegreeModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <div className="modal-form" style={{ padding: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                  Degree Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className="modal-input"
                  value={degreeForm.name}
                  onChange={e => setDF('name', e.target.value)}
                  placeholder="e.g. BSc Mathematics, BSc IT, B.E(Civil)"
                  required
                  style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                  Degree Code <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className="modal-input"
                  value={degreeForm.code}
                  onChange={e => setDF('code', e.target.value)}
                  placeholder="e.g. BSC-MATH, BSC-IT, BE-CIVIL"
                  required
                  style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                  Level <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className="modal-input"
                  value={degreeForm.level}
                  onChange={e => setDF('level', e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                >
                  <option value="bachelor">Bachelor</option>
                  <option value="master">Master</option>
                  <option value="doctorate">Doctorate</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                  Description
                </label>
                <input
                  className="modal-input"
                  value={degreeForm.description}
                  onChange={e => setDF('description', e.target.value)}
                  placeholder="Optional description"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                />
              </div>
            </div>
            <div className="modal-actions" style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-cancel" onClick={() => setDegreeModal(false)} style={{ padding: '0.625rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button className="btn-modal-submit" onClick={saveDegree} disabled={degreeSubmitting} style={{ padding: '0.625rem 1.25rem', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                {degreeSubmitting ? '⏳ Saving...' : (editDegree ? '💾 Save Changes' : '＋ Create Degree')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Rich demo data (used as fallback when API is offline) ── */
const DEMO_STUDENTS: Student[] = [
  { id:1,  graduate_name:'Maung Maung Aye',     father_name:'U Aye Lwin',      gender:'Male',   date_of_birth:'2000-03-15', nrc_number:'12/OUKAMA(N)123456', student_id:'CS-2019-001', degree:'B.E(Civil)',              specialization:'Structural Engineering', graduation_year:2023 },
  { id:2,  graduate_name:'Su Su Htwe',           father_name:'U Htwe Naing',    gender:'Female', date_of_birth:'2001-07-22', nrc_number:'9/MAYAKA(N)234567',  student_id:'CS-2020-012', degree:'B.E(Mechanical)',         specialization:'Thermal Engineering',    graduation_year:2024 },
  { id:3,  graduate_name:'Ko Ko Naing',          father_name:'U Naing Lin',     gender:'Male',   date_of_birth:'1999-11-05', nrc_number:'5/KAPANA(N)345678',  student_id:'CS-2018-034', degree:'B.E(Electrical)',         specialization:'Power Systems',          graduation_year:2022 },
  { id:4,  graduate_name:'Ei Ei Mon',            father_name:'U Mon Win',       gender:'Female', date_of_birth:'2002-01-18', nrc_number:'14/DAKANA(N)456789', student_id:'CS-2021-008', degree:'B.E(Computer)',           specialization:'Artificial Intelligence',graduation_year:2025 },
  { id:5,  graduate_name:'Zaw Lin Htet',         father_name:'U Htet Aung',     gender:'Male',   date_of_birth:'2000-09-30', nrc_number:'8/PHENMA(N)567890',  student_id:'CS-2019-055', degree:'B.Sc(Physics)',           specialization:'',                       graduation_year:2023 },
  { id:6,  graduate_name:'Hnin Wai Hnin',        father_name:'U Wai Phyo',      gender:'Female', date_of_birth:'2001-04-12', nrc_number:'1/BAGANA(N)678901',  student_id:'CS-2020-023', degree:'B.Sc(Chemistry)',         specialization:'Organic Chemistry',      graduation_year:2024 },
  { id:7,  graduate_name:'Aung Kyaw Zin',        father_name:'U Kyaw Tint',     gender:'Male',   date_of_birth:'1998-12-25', nrc_number:'3/DAWNA(N)789012',   student_id:'CS-2017-067', degree:'M.Sc(Engineering)',       specialization:'',                       graduation_year:2022 },
  { id:8,  graduate_name:'Khin Myo Thant',       father_name:'U Myo Win',       gender:'Female', date_of_birth:'2000-06-08', nrc_number:'7/TATANA(N)890123',  student_id:'CS-2019-089', degree:'B.E(Petroleum)',          specialization:'Reservoir Engineering',  graduation_year:2023 },
  { id:9,  graduate_name:'Pyae Sone Kyaw',       father_name:'U Kyaw Zin',      gender:'Male',   date_of_birth:'2001-02-14', nrc_number:'11/PAKANA(N)901234', student_id:'CS-2020-034', degree:'B.E(Mining)',             specialization:'',                       graduation_year:2024 },
  { id:10, graduate_name:'Thida Aye',            father_name:'U Aye Myint',     gender:'Female', date_of_birth:'2002-08-19', nrc_number:'2/LAGANA(N)012345',  student_id:'CS-2021-017', degree:'B.Sc(Mathematics)',       specialization:'Applied Mathematics',    graduation_year:2025 },
  { id:11, graduate_name:'Min Htet Aung',        father_name:'U Aung Than',     gender:'Male',   date_of_birth:'1999-05-27', nrc_number:'6/MAHANA(N)123456',  student_id:'CS-2018-078', degree:'B.E(Architecture)',       specialization:'Urban Planning',         graduation_year:2022 },
  { id:12, graduate_name:'Nwe Nwe Oo',           father_name:'U Oo Khin',       gender:'Female', date_of_birth:'2000-10-03', nrc_number:'13/MASANA(N)234567', student_id:'CS-2019-102', degree:'B.Com',                   specialization:'Accounting',             graduation_year:2023 },
  { id:13, graduate_name:'Kaung Htet Kyaw',      father_name:'U Kyaw Linn',     gender:'Male',   date_of_birth:'2001-12-11', nrc_number:'4/WUNNA(N)345678',   student_id:'CS-2020-067', degree:'B.A(Economics)',          specialization:'Microeconomics',         graduation_year:2024 },
  { id:14, graduate_name:'Aye Chan Myat',        father_name:'U Myat Kyaw',     gender:'Female', date_of_birth:'2000-07-29', nrc_number:'10/DALANA(N)456789', student_id:'CS-2019-089', degree:'B.E(Civil)',              specialization:'Water Resources',        graduation_year:2023 },
  { id:15, graduate_name:'Wai Yan Phyo',         father_name:'U Phyo Zaw',      gender:'Male',   date_of_birth:'1998-03-16', nrc_number:'15/YAMANA(N)567890', student_id:'CS-2017-111', degree:'B.E(Mechanical)',         specialization:'Automotive Engineering', graduation_year:2022 },
];

const DEMO_LOGS: Log[] = [
  { id:1,  created_at:'2026-04-13T09:23:00Z', verifier_name:'John Smith',   organization_type:'Employer',          organization_name:'ABC Company Ltd',    searched_name:'Maung Maung Aye',   searched_degree:'B.E(Civil)',     result:'verified',  status:'success' },
  { id:2,  created_at:'2026-04-13T08:15:00Z', verifier_name:'Mary Johnson', organization_type:'Recruitment Agency',organization_name:'TopTalent Myanmar',  searched_name:'Ko Ko Naing',       searched_degree:'B.E(Electrical)',result:'not_found', status:'failed'  },
  { id:3,  created_at:'2026-04-12T14:45:00Z', verifier_name:'David Lee',    organization_type:'Embassy',           organization_name:'Australian Embassy',  searched_name:'Su Su Htwe',        searched_degree:'B.E(Mechanical)',result:'verified',  status:'success' },
  { id:4,  created_at:'2026-04-12T11:30:00Z', verifier_name:'Sarah Wilson', organization_type:'University',        organization_name:'University of Yangon', searched_name:'Ei Ei Mon',         searched_degree:'B.E(Computer)',  result:'verified',  status:'success' },
  { id:5,  created_at:'2026-04-11T16:20:00Z', verifier_name:'William Tan',  organization_type:'Government',        organization_name:'Ministry of Health',  searched_name:'Hnin Wai Hnin',     searched_degree:'B.Sc(Chemistry)',result:'verified',  status:'success' },
  { id:6,  created_at:'2026-04-11T10:05:00Z', verifier_name:'Alice Chen',   organization_type:'Employer',          organization_name:'XYZ Corporation',     searched_name:'Nonexistent Person',searched_degree:'B.E(Civil)',     result:'not_found', status:'failed'  },
  { id:7,  created_at:'2026-04-10T15:30:00Z', verifier_name:'Bob Kyaw',     organization_type:'Employer',          organization_name:'MML Company',         searched_name:'Khin Myo Thant',    searched_degree:'B.E(Petroleum)', result:'verified',  status:'success' },
  { id:8,  created_at:'2026-04-10T09:00:00Z', verifier_name:'Zin Mar Oo',   organization_type:'Bank',              organization_name:'KBZ Bank',            searched_name:'Aung Kyaw Zin',     searched_degree:'M.Sc(Engineering)',result:'verified', status:'success' },
  { id:9,  created_at:'2026-04-09T13:45:00Z', verifier_name:'James Wong',   organization_type:'Recruitment Agency',organization_name:'HR Solutions',        searched_name:'Wrong Name',        searched_degree:'B.E(Mining)',    result:'not_found', status:'failed'  },
  { id:10, created_at:'2026-04-09T08:20:00Z', verifier_name:'Emily Hla',    organization_type:'Embassy',           organization_name:'Japanese Embassy',    searched_name:'Thida Aye',         searched_degree:'B.Sc(Mathematics)',result:'verified',status:'success' },
  { id:11, created_at:'2026-04-08T16:10:00Z', verifier_name:'Peter Zaw',    organization_type:'Employer',          organization_name:'Yoma Bank',           searched_name:'Min Htet Aung',     searched_degree:'B.E(Architecture)',result:'verified',status:'success' },
  { id:12, created_at:'2026-04-08T11:55:00Z', verifier_name:'Linda Myint',  organization_type:'University',        organization_name:'Mandalay University', searched_name:'Pyae Sone Kyaw',    searched_degree:'B.E(Mining)',    result:'verified',  status:'success' },
];

export default UserAdminDashboard;
