import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI, verificationAPI, degreeAPI, universityAPI } from '../../services/api';
import '../../styles/admin/UserAdminDashboard.css';

type Tab = 'upload' | 'students' | 'pending_review' | 'logs' | 'degree' | 'addstudent' | 'settings';

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
  const [studentTotal,  setStudentTotal]  = useState(0);
  const [loadError,     setLoadError]     = useState('');
  const [studentPage,   setStudentPage]   = useState(1);

  /* Logs filters */
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [logPage,   setLogPage]   = useState(1);

  /* Pending Reviews (Registrar Queue) */
  const [pendingLogs,      setPendingLogs]      = useState<any[]>([]);
  const [pendingSearch,    setPendingSearch]    = useState('');
  const [reviewModalLog,   setReviewModalLog]   = useState<any | null>(null);
  const [reviewAction,     setReviewAction]     = useState<'approve' | 'reject'>('approve');
  const [archiveRef,       setArchiveRef]       = useState('');
  const [reviewNotes,      setReviewNotes]      = useState('');
  const [regGender,        setRegGender]        = useState('');
  const [regNrc,           setRegNrc]           = useState('');
  const [regStudentId,     setRegStudentId]     = useState('');
  const [regDob,           setRegDob]           = useState('');
  const [resolving,        setResolving]        = useState(false);
  const [resolveSuccess,   setResolveSuccess]   = useState<string | null>(null);

  /* Degree Management */
  const [degreeModal, setDegreeModal] = useState(false);
  const [editDegree, setEditDegree] = useState<any>(null);
  const [degreeForm, setDegreeForm] = useState({ name: '', description: '', code: '', level: 'bachelor', status: 'active' });
  const [degreeSubmitting, setDegreeSubmitting] = useState(false);

  /* University Settings */
  const [uniForm, setUniForm] = useState({
    name: user?.university?.name || '',
    description: user?.university?.description || '',
    logo_url: user?.university?.logo_url || '',
    verification_notice: user?.university?.verification_notice || '',
  });
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const fetchUniversity = async () => {
    if (!user?.university_id) return;
    setLoading(true);
    try {
      const res = await universityAPI.getOne(user.university_id);
      const data = res.data;
      setUniForm({
        name: data.name || '',
        description: data.description || '',
        logo_url: data.logo_url || '',
        verification_notice: data.verification_notice || '',
      });
      const updatedUser = { ...user, university: data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to fetch university details', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.university_id) return;
    setSettingsSubmitting(true);
    setSettingsSuccess(false);
    try {
      const res = await universityAPI.update(user.university_id, {
        description: uniForm.description,
        logo_url: uniForm.logo_url,
        verification_notice: uniForm.verification_notice,
      });
      setSettingsSuccess(true);
      const updatedUser = { ...user, university: res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUniForm({
        name: res.data.name || '',
        description: res.data.description || '',
        logo_url: res.data.logo_url || '',
        verification_notice: res.data.verification_notice || '',
      });
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update university settings');
    } finally {
      setSettingsSubmitting(false);
    }
  };

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
  const successRef = useRef<HTMLDivElement>(null);

  /* Student photo upload */
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const setSF = (k: string, v: string | number) => setStudentForm(p => ({ ...p, [k]: v }));

  const handlePhotoPick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please choose an image file.'); return; }
    if (file.size > 4 * 1024 * 1024) { alert('Image must be 4 MB or smaller.'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const resetStudentForm = () => {
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
    clearPhoto();
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.university_id) { alert('University ID not found'); return; }
    setSubmitting(true);
    setSubmitSuccess(false);
    try {
      let photo_url: string | undefined;
      if (photoFile) {
        const up = await studentAPI.uploadPhoto(photoFile);
        photo_url = up.data.url;
      }
      await studentAPI.create({
        ...studentForm,
        university_id: user.university_id,
        ...(photo_url ? { photo_url } : {}),
      });
      setSubmitSuccess(true);
      resetStudentForm();
      // The banner renders above the form while the Save button sits at the
      // bottom, so scroll it into view — otherwise the save looks like it
      // did nothing.
      requestAnimationFrame(() => {
        successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (e: any) {
      alert(e.friendlyMessage || e.response?.data?.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPendingLogs();
  }, []);

  useEffect(() => {
    if (tab === 'students')       fetchStudents();
    if (tab === 'pending_review') fetchPendingLogs();
    if (tab === 'logs')           fetchLogs();
    if (tab === 'degree')         fetchDegrees();
    if (tab === 'addstudent')     { fetchDegrees(); setSubmitSuccess(false); }
    if (tab === 'settings')       fetchUniversity();
  }, [tab]);

  // Debounced server-side student search.
  useEffect(() => {
    if (tab !== 'students') return;
    const t = setTimeout(() => {
      setStudentPage(1);
      fetchStudents();
    }, 350);
    return () => clearTimeout(t);
  }, [studentSearch]);

  const fetchPendingLogs = async () => {
    try {
      const params: any = { status: 'pending' };
      if (user?.university_id) params.university_id = user.university_id;
      const res = await verificationAPI.getLogs(params);
      setPendingLogs(res.data.data || res.data || []);
    } catch {
      setPendingLogs([]);
    }
  };

  const openReviewModal = (log: any, action: 'approve' | 'reject') => {
    setReviewModalLog(log);
    setReviewAction(action);
    setArchiveRef('');
    setReviewNotes(
      action === 'approve'
        ? 'Confirmed and verified against university convocation register archives.'
        : 'Record not found in university archives.'
    );
    // Left blank on purpose: the registrar must read these off the archive
    // ledger. Pre-filling placeholders would write invented identity details
    // into an official graduate record.
    setRegGender(log.student?.gender || '');
    setRegNrc(log.student?.nrc_number || '');
    setRegStudentId(log.student?.student_id || '');
    setRegDob(log.student?.date_of_birth ? String(log.student.date_of_birth).slice(0, 10) : '');
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalLog) return;
    setResolving(true);
    try {
      await verificationAPI.resolveLog(reviewModalLog.id, {
        action: reviewAction,
        archive_ref: archiveRef || undefined,
        notes: reviewNotes || undefined,
        student_id: regStudentId || undefined,
        nrc_number: regNrc || undefined,
        date_of_birth: regDob || undefined,
        gender: regGender || undefined,
      });

      setResolveSuccess(
        reviewAction === 'approve'
          ? `✅ Successfully approved and verified record for "${reviewModalLog.searched_name}"! Verifier dashboard updated instantly.`
          : `⚠️ Verification request for "${reviewModalLog.searched_name}" marked as rejected.`
      );

      setReviewModalLog(null);
      fetchPendingLogs();
      fetchLogs();
      fetchStudents();
      setTimeout(() => setResolveSuccess(null), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process request.');
    } finally {
      setResolving(false);
    }
  };

  // Search runs on the server: the list is paginated, so filtering only the
  // rows already loaded would silently miss most of the cohort.
  const fetchStudents = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params: any = { per_page: 100 };
      if (user?.university_id) params.university_id = user.university_id;
      if (studentSearch.trim()) params.search = studentSearch.trim();
      const res = await studentAPI.getAll(params);
      setStudents(res.data.data || res.data);
      setStudentTotal(res.data.total ?? (res.data.data || res.data).length);
    } catch {
      // Never fall back to sample records here — showing invented graduates
      // as if they were real university data is worse than showing nothing.
      setStudents([]);
      setStudentTotal(0);
      setLoadError('Could not load student records. Please check your connection and try again.');
    } finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params: any = {};
      if (user?.university_id) params.university_id = user.university_id;
      const res = await verificationAPI.getLogs(params);
      setLogs(res.data.data || res.data);
    } catch {
      setLogs([]);
      setLoadError('Could not load verification logs. Please try again.');
    } finally { setLoading(false); }
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

  /* Derived data — the server already applied `search`, so no second filter. */
  const filteredStudents = students;
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
          <div className="ud-logo-sub">Graduate Record Data Entry System</div>
        </div>

        <nav className="ud-nav">
          {([
            ['upload',         '📁', 'Data Upload',          0],
            ['students',       '👨‍🎓', 'All Students',         0],
            ['pending_review', '⏳', 'Pending Reviews',       pendingLogs.length],
            ['logs',           '📋', 'Activity Logs',        0],
            ['degree',         '🎓', 'Degree',               0],
            ['addstudent',     '➕', 'Add Student Manually', 0],
            ['settings',       '⚙️', 'University Settings',   0],
          ] as [Tab, string, string, number][]).map(([id, icon, label, badgeCount]) => (
            <button
              key={id}
              className={`ud-nav-item ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <span>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {badgeCount > 0 && <span className="ud-nav-badge">{badgeCount}</span>}
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
            {tab === 'upload'         && '📁 Data Upload'}
            {tab === 'students'       && '👨‍🎓 All Students'}
            {tab === 'pending_review' && '⏳ Registrar Archival Review Queue'}
            {tab === 'logs'           && '📋 Verifier Activity Logs'}
            {tab === 'degree'         && '🎓 Degree Management'}
            {tab === 'addstudent'     && '➕ Add Student Manually'}
            {tab === 'settings'       && '⚙️ University Settings'}
          </span>
          <div className="ud-topbar-right">
            <button className="ud-icon-btn" onClick={() => { if (tab === 'students') fetchStudents(); if (tab === 'pending_review') fetchPendingLogs(); if (tab === 'logs') fetchLogs(); if (tab === 'degree') fetchDegrees(); }} title="Refresh">🔄</button>
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
              {loadError && (
                <div style={{ margin: '1rem 1.5rem 0', padding: '0.75rem 1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: '0.85rem' }}>
                  ⚠️ {loadError}
                </div>
              )}
              <div className="ud-table-header">
                <div>
                  <div className="ud-table-title">All Student Records</div>
                  <div className="ud-table-meta">
                    {studentTotal.toLocaleString()} student{studentTotal === 1 ? '' : 's'}
                    {studentTotal > students.length && ` · showing first ${students.length}`}
                    {studentSearch.trim() && ' matching your search'}
                  </div>
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

          {/* ── PENDING REVIEWS TAB (Registrar Archival Review Queue) ── */}
          {tab === 'pending_review' && (
            <div className="ud-pending-queue-wrap">
              {/* Notification Banner */}
              {resolveSuccess && (
                <div className="ud-alert-success">
                  {resolveSuccess}
                </div>
              )}

              {/* Quick stats */}
              <div className="ud-stats">
                <div className="ud-stat">
                  <div className="ud-stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
                  <div>
                    <div className="ud-stat-val">{pendingLogs.length}</div>
                    <div className="ud-stat-lbl">Pending Review Requests</div>
                  </div>
                </div>

                <div className="ud-stat">
                  <div className="ud-stat-icon" style={{ background: '#fee2e2' }}>🚨</div>
                  <div>
                    <div className="ud-stat-val">
                      {pendingLogs.filter(l => {
                        if (!l.sla_due_at) return false;
                        const diff = (new Date(l.sla_due_at).getTime() - Date.now()) / 86400000;
                        return diff <= 1.5;
                      }).length}
                    </div>
                    <div className="ud-stat-lbl">Urgent / SLA Expiring</div>
                  </div>
                </div>

                <div className="ud-stat">
                  <div className="ud-stat-icon" style={{ background: '#d1fae5' }}>⚡</div>
                  <div>
                    <div className="ud-stat-val">Instant Sync</div>
                    <div className="ud-stat-lbl">Auto-updates Verifier Portal</div>
                  </div>
                </div>
              </div>

              {/* Table Card */}
              <div className="ud-table-card">
                <div className="ud-table-header">
                  <div>
                    <div className="ud-table-title">Registrar Archival Review Queue</div>
                    <div className="ud-table-meta">
                      Older/archived academic searches requiring manual registrar archive book verification
                    </div>
                  </div>
                  <div className="filter-bar">
                    <div className="filter-search">
                      <span>🔍</span>
                      <input
                        placeholder="Search candidate name or Request ID..."
                        value={pendingSearch}
                        onChange={e => setPendingSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="ud-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Request Ref</th>
                        <th>Candidate Name</th>
                        <th>Father's Name</th>
                        <th>Degree / Course</th>
                        <th>Graduation Year</th>
                        <th>Requested By</th>
                        <th>Date Submitted</th>
                        <th>SLA Due</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLogs
                        .filter(l => {
                          const q = pendingSearch.toLowerCase();
                          return (
                            !pendingSearch ||
                            (l.searched_name || '').toLowerCase().includes(q) ||
                            (l.request_ref || '').toLowerCase().includes(q) ||
                            (l.searched_degree || '').toLowerCase().includes(q) ||
                            (l.organization_name || '').toLowerCase().includes(q)
                          );
                        })
                        .map((l, i) => {
                          const reqId = l.request_ref || `#VR-${l.id}`;
                          return (
                            <tr key={l.id}>
                              <td>{i + 1}</td>
                              <td className="td-mono" style={{ fontWeight: 700, color: '#1e293b' }}>
                                {reqId}
                              </td>
                              <td className="td-name">
                                {l.searched_name}
                              </td>
                              <td>{l.searched_father_name || '—'}</td>
                              <td>{l.searched_degree}</td>
                              <td>
                                <span className="ud-pill-blue">
                                  {l.searched_year}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{l.organization_name || l.verifier_name}</div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{l.verifier_email || l.organization_type}</div>
                              </td>
                              <td>{new Date(l.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                              <td>
                                {l.sla_due_at ? (
                                  <span style={{ color: '#c53030', fontWeight: 600, fontSize: '0.82rem' }}>
                                    ⏱ {new Date(l.sla_due_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                  </span>
                                ) : (
                                  <span style={{ color: '#2e7d32', fontWeight: 600, fontSize: '0.82rem' }}>Normal</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                  <button
                                    className="ud-btn-approve"
                                    onClick={() => openReviewModal(l, 'approve')}
                                    title="Confirm record in university archives and verify"
                                  >
                                    ✓ Confirm &amp; Approve
                                  </button>
                                  <button
                                    className="ud-btn-reject"
                                    onClick={() => openReviewModal(l, 'reject')}
                                    title="Record not found or invalid"
                                  >
                                    ✕ Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      {pendingLogs.length === 0 && (
                        <tr>
                          <td colSpan={10}>
                            <div className="empty-state" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                              <span style={{ fontSize: '3rem' }}>🎉</span>
                              <h3 style={{ margin: '0.5rem 0', color: '#1e293b' }}>Queue is completely clear!</h3>
                              <p>No manual archival verification requests pending for your university at this time.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Review Modal */}
              {reviewModalLog && (
                <div className="ud-modal-backdrop" onClick={() => setReviewModalLog(null)}>
                  <div className="ud-modal-card" onClick={e => e.stopPropagation()}>
                    <div className="ud-modal-header">
                      <h3>
                        {reviewAction === 'approve'
                          ? '✓ Confirm & Approve Degree Record'
                          : '✕ Reject Verification Request'}
                      </h3>
                      <button className="ud-modal-close" onClick={() => setReviewModalLog(null)}>✕</button>
                    </div>

                    <form onSubmit={handleResolveSubmit} className="ud-modal-body">
                      {/* Candidate info summary */}
                      <div className="ud-candidate-box">
                        <div className="ud-candidate-row">
                          <span className="ud-lbl">Request ID:</span>
                          <span className="ud-val" style={{ fontWeight: 700 }}>{reviewModalLog.request_ref || `#VR-${reviewModalLog.id}`}</span>
                        </div>
                        <div className="ud-candidate-row">
                          <span className="ud-lbl">Candidate:</span>
                          <span className="ud-val" style={{ fontWeight: 700, color: '#1e40af' }}>{reviewModalLog.searched_name}</span>
                        </div>
                        <div className="ud-candidate-row">
                          <span className="ud-lbl">Father's Name:</span>
                          <span className="ud-val">{reviewModalLog.searched_father_name || '—'}</span>
                        </div>
                        <div className="ud-candidate-row">
                          <span className="ud-lbl">Degree / Year:</span>
                          <span className="ud-val">{reviewModalLog.searched_degree} ({reviewModalLog.searched_year})</span>
                        </div>
                        <div className="ud-candidate-row">
                          <span className="ud-lbl">Verifier:</span>
                          <span className="ud-val">{reviewModalLog.organization_name} ({reviewModalLog.verifier_email})</span>
                        </div>
                      </div>

                      {reviewAction === 'approve' ? (
                        <>
                          <div className="ud-form-group">
                            <label>University Archive Ledger Reference (Book / Volume / Roll No.)</label>
                            <input
                              type="text"
                              value={archiveRef}
                              onChange={e => setArchiveRef(e.target.value)}
                              placeholder="e.g. Convocation Register Vol 8, Page 142, Roll 034"
                              required
                            />
                            <span className="ud-form-hint">Provides official provenance for audit trails.</span>
                          </div>

                          <div className="ud-form-hint" style={{ marginBottom: '0.75rem' }}>
                            ⚠️ Enter the graduate's real details exactly as they appear in the archive
                            ledger — these are stored as the official verified record.
                          </div>

                          <div className="ud-form-row">
                            <div className="ud-form-group">
                              <label>Graduate Reg No. / Student ID</label>
                              <input
                                type="text"
                                value={regStudentId}
                                onChange={e => setRegStudentId(e.target.value)}
                                placeholder="e.g. TU-2015-034"
                              />
                            </div>
                            <div className="ud-form-group">
                              <label>NRC Number *</label>
                              <input
                                type="text"
                                value={regNrc}
                                onChange={e => setRegNrc(e.target.value)}
                                placeholder="e.g. 5/Kapana(N)12345"
                                required
                              />
                            </div>
                          </div>

                          <div className="ud-form-row">
                            <div className="ud-form-group">
                              <label>Gender *</label>
                              <select value={regGender} onChange={e => setRegGender(e.target.value)} required>
                                <option value="">-- Select --</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="ud-form-group">
                              <label>Date of Birth *</label>
                              <input
                                type="date"
                                value={regDob}
                                onChange={e => setRegDob(e.target.value)}
                                max={new Date().toISOString().slice(0, 10)}
                                required
                              />
                            </div>
                          </div>

                          <div className="ud-form-group">
                            <label>Registrar Verification Notes</label>
                            <textarea
                              rows={2}
                              value={reviewNotes}
                              onChange={e => setReviewNotes(e.target.value)}
                              placeholder="Confirmed record in physical archives."
                            />
                          </div>

                          <div className="ud-form-alert">
                            ℹ️ Upon approval, this request will be immediately marked as <strong>Verified</strong> in the Verifier's Dashboard, and added to the official student database.
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="ud-form-group">
                            <label>Rejection Reason / Notes</label>
                            <textarea
                              rows={3}
                              value={reviewNotes}
                              onChange={e => setReviewNotes(e.target.value)}
                              placeholder="State the archival check outcome (e.g. Record not found in university registers for given academic session)."
                              required
                            />
                          </div>
                        </>
                      )}

                      <div className="ud-modal-actions">
                        <button
                          type="button"
                          className="ud-btn-secondary"
                          onClick={() => setReviewModalLog(null)}
                          disabled={resolving}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={reviewAction === 'approve' ? 'ud-btn-approve-submit' : 'ud-btn-reject-submit'}
                          disabled={resolving}
                        >
                          {resolving ? 'Processing...' : reviewAction === 'approve' ? 'Confirm & Approve' : 'Confirm Rejection'}
                        </button>
                      </div>
                    </form>
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
                <div ref={successRef} className="upload-result" style={{ margin: '1.5rem' }}>
                  <span className="upload-result-icon">✅</span>
                  <div className="upload-result-info">
                    <strong>Student Added Successfully!</strong>
                    <span>The student record has been saved. You can enter the next one below.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleManualSubmit} style={{ padding: '1.5rem' }}>
                {/* Student Photo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    style={{
                      width: 96, height: 96, flexShrink: 0, borderRadius: '10px',
                      border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
                      background: '#f8fafc', color: '#94a3b8', fontSize: '1.5rem',
                    }}
                  >
                    {photoPreview
                      ? <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '📷'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Upload Student Photo</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      JPG, PNG or WEBP · max 4 MB · optional
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="upload-browse-btn"
                        onClick={() => photoInputRef.current?.click()}
                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                      >
                        📁 Choose Photo
                      </button>
                      {photoPreview && (
                        <button
                          type="button"
                          className="upload-result-clear"
                          onClick={clearPhoto}
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={e => handlePhotoPick(e.target.files?.[0])}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

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

                  {/* Graduate Registration Number */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Graduate Registration Number
                    </label>
                    <input
                      type="text"
                      className="modal-input"
                      value={studentForm.student_id}
                      onChange={e => setSF('student_id', e.target.value)}
                      placeholder="e.g. GRN-2019-001"
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
                    onClick={resetStudentForm}
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

          {/* ── SETTINGS TAB (University Settings) ── */}
          {tab === 'settings' && (
            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <div className="sc-title">⚙️ University Settings</div>
                  <div className="sc-sub">Manage your university public profile and verification notices</div>
                </div>
              </div>

              {settingsSuccess && (
                <div className="upload-result" style={{ margin: '1.5rem' }}>
                  <span className="upload-result-icon">✅</span>
                  <div className="upload-result-info">
                    <strong>Settings Saved Successfully!</strong>
                    <span>Your university details and verification notice have been updated.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSettingsSubmit} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* University Name (ReadOnly) */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      University Name
                    </label>
                    <input
                      type="text"
                      className="modal-input"
                      value={uniForm.name}
                      readOnly
                      disabled
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                    />
                    <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                      To rename the university, please contact the Super Admin.
                    </span>
                  </div>

                  {/* Logo URL */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Logo Image URL
                    </label>
                    <input
                      type="url"
                      className="modal-input"
                      value={uniForm.logo_url}
                      onChange={e => setUniForm(p => ({ ...p, logo_url: e.target.value }))}
                      placeholder="e.g. https://domain.com/logo.png"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      University Description
                    </label>
                    <textarea
                      className="modal-input"
                      value={uniForm.description}
                      onChange={e => setUniForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Enter description..."
                      rows={4}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>

                  {/* Verification Notice */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Verification Notice (Shown on Public Profile)
                    </label>
                    <textarea
                      className="modal-input"
                      value={uniForm.verification_notice}
                      onChange={e => setUniForm(p => ({ ...p, verification_notice: e.target.value }))}
                      placeholder="Specify who can get instant verification results and the processing time for manual requests..."
                      rows={5}
                      required
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                      This notice will be rendered on the <strong>University Info</strong> page to guide verifiers.
                    </span>
                  </div>

                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="upload-browse-btn"
                    disabled={settingsSubmitting}
                    style={{ background: '#1d4ed8', color: 'white' }}
                  >
                    {settingsSubmitting ? '⏳ Saving...' : '💾 Save Settings'}
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

export default UserAdminDashboard;
