import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { universityAPI, userAPI, verificationAPI } from '../../services/api';
import '../../styles/admin/SuperAdminDashboard.css';

type Tab = 'dashboard' | 'universities' | 'users' | 'analytics' | 'settings';

interface University { id: number; name: string; location: string; description?: string; logo_url?: string; status: 'active'|'inactive'; students_count?: number; }
interface User       { id: number; name: string; email: string; role: string; university?: { name: string }; }

const initUni  = { name: '', location: '', description: '', logo_url: '', status: 'active' as const };
const initUser = { name: '', email: '', password: '', role: 'university_admin', university_id: '' };

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('dashboard');

  /* Data */
  const [universities, setUniversities] = useState<University[]>([]);
  const [users,        setUsers]        = useState<User[]>([]);
  const [stats,        setStats]        = useState({ total_universities: 0, active_universities: 0, total_students: 0, total_verifications: 0, success_rate: 0 });
  const [activities,   setActivities]   = useState<any[]>([]);
  const [_loading,     setLoading]      = useState(false);

  /* Modals */
  const [uniModal,  setUniModal]  = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [editUni,   setEditUni]   = useState<University | null>(null);
  const [editUser,  setEditUser]  = useState<User | null>(null);
  const [uniForm,   setUniForm]   = useState(initUni);
  const [userForm,  setUserForm]  = useState(initUser);

  /* Search filters */
  const [uniSearch,  setUniSearch]  = useState('');
  const [userSearch, setUserSearch] = useState('');

  const setUF = (k: string, v: string) => setUniForm(p => ({ ...p, [k]: v }));
  const setUsr = (k: string, v: string) => setUserForm(p => ({ ...p, [k]: v }));

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uniRes, userRes, statsRes, actRes] = await Promise.all([
        universityAPI.getAll(),
        userAPI.getAll(),
        universityAPI.stats(),
        verificationAPI.getRecentActivity(),
      ]);
      setUniversities(uniRes.data);
      setUsers(userRes.data);
      setStats(statsRes.data);
      setActivities(actRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  /* University CRUD */
  const openAddUni  = () => { setEditUni(null); setUniForm(initUni); setUniModal(true); };
  const openEditUni = (u: University) => { setEditUni(u); setUniForm({ name: u.name, location: u.location, description: u.description || '', logo_url: u.logo_url || '', status: u.status as 'active' }); setUniModal(true); };
  const saveUni = async () => {
    try {
      if (editUni) await universityAPI.update(editUni.id, uniForm);
      else         await universityAPI.create(uniForm);
      setUniModal(false);
      fetchAll();
    } catch (e: any) { alert(e.response?.data?.message || 'Error saving university'); }
  };
  const deleteUni = async (id: number) => {
    if (!confirm('Delete this university?')) return;
    await universityAPI.delete(id); fetchAll();
  };

  /* User CRUD */
  const openAddUser  = () => { setEditUser(null); setUserForm(initUser); setUserModal(true); };
  const openEditUser = (u: User) => { setEditUser(u); setUserForm({ name: u.name, email: u.email, password: '', role: u.role, university_id: '' }); setUserModal(true); };
  const saveUser = async () => {
    try {
      const payload: any = { name: userForm.name, email: userForm.email, role: userForm.role };
      if (userForm.password)     payload.password = userForm.password;
      if (userForm.university_id) payload.university_id = parseInt(userForm.university_id);
      if (editUser) await userAPI.update(editUser.id, payload);
      else          await userAPI.create(payload);
      setUserModal(false);
      fetchAll();
    } catch (e: any) { alert(e.response?.data?.message || 'Error saving user'); }
  };
  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    await userAPI.delete(id); fetchAll();
  };

  const filteredUnis  = universities.filter(u => `${u.name} ${u.location}`.toLowerCase().includes(uniSearch.toLowerCase()));
  const filteredUsers = users.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase()));

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const barData = months.map((m) => ({ label: m, value: Math.floor(Math.random() * 900 + 200) }));

  const initials = (name: string) => name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'SA';

  return (
    <div className="super-dashboard">

      {/* ── Sidebar ── */}
      <aside className="sd-sidebar">
        <div className="sd-logo">
          <div className="sd-logo-icon">🎓</div>
          <div className="sd-logo-text">
            <span className="sd-logo-title">DVP Admin</span>
            <span className="sd-logo-sub">Super Admin</span>
          </div>
        </div>

        <nav className="sd-nav">
          <span className="sd-nav-label">Main Menu</span>
          {([
            ['dashboard',    '📊', 'Dashboard'],
            ['universities', '🏛️', 'Universities'],
            ['users',        '👥', 'User Management'],
            ['analytics',    '📈', 'Analytics'],
            ['settings',     '⚙️', 'Settings'],
          ] as [Tab, string, string][]).map(([id, icon, label]) => (
            <button
              key={id}
              className={`sd-nav-item ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <span className="nav-item-icon">{icon}</span>
              {label}
              {id === 'universities' && universities.length > 0 && (
                <span className="nav-item-badge">{universities.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sd-sidebar-footer">
          <div className="sd-user-card">
            <div className="sd-user-avatar">{initials(user?.name || 'SA')}</div>
            <div className="sd-user-info">
              <div className="sd-user-name">{user?.name || 'Super Admin'}</div>
              <div className="sd-user-role">Super Admin</div>
            </div>
          </div>
          <button className="sd-logout-btn" onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="sd-main">
        {/* Topbar */}
        <div className="sd-topbar">
          <span className="sd-topbar-title">
            {tab === 'dashboard'    && '📊 Dashboard Overview'}
            {tab === 'universities' && '🏛️ University Management'}
            {tab === 'users'        && '👥 User Management'}
            {tab === 'analytics'    && '📈 Analytics & Reports'}
            {tab === 'settings'     && '⚙️ System Settings'}
          </span>
          <div className="sd-topbar-right">
            <button className="topbar-icon-btn" title="Refresh" onClick={fetchAll}>🔄</button>
            <button className="topbar-icon-btn" title="Notifications">🔔</button>
          </div>
        </div>

        <div className="sd-content">

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <>
              <div className="stats-grid">
                {[
                  { icon: '🏛️', colorCls: 'icon-blue',   val: stats.total_universities,    label: 'Total Universities', trend: `${stats.active_universities} Active`, cls: 'trend-info' },
                  { icon: '👨‍🎓', colorCls: 'icon-green',  val: stats.total_students?.toLocaleString(), label: 'Total Students',      trend: '+12.3% this month', cls: 'trend-up' },
                  { icon: '✅', colorCls: 'icon-purple', val: stats.total_verifications?.toLocaleString(), label: 'Total Verifications', trend: `${stats.success_rate}% Success`, cls: 'trend-up' },
                  { icon: '📈', colorCls: 'icon-amber',  val: `${stats.success_rate}%`,    label: 'Success Rate',        trend: 'Excellent', cls: 'trend-up' },
                ].map((s, i) => (
                  <div className="stat-card" key={i}>
                    <div className={`stat-icon-wrap ${s.colorCls}`}>{s.icon}</div>
                    <div className="stat-info">
                      <h3>{s.val}</h3>
                      <p>{s.label}</p>
                      <span className={`stat-trend ${s.cls}`}>↑ {s.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity feed */}
              <div className="section-header">
                <div>
                  <div className="section-title">Recent Activity</div>
                  <div className="section-sub">Latest system events</div>
                </div>
              </div>

              <div className="activity-card">
                <div className="activity-list">
                  {activities.length > 0 ? activities.slice(0, 8).map((a: any, i: number) => (
                    <div className="activity-item" key={i}>
                      <div className={`activity-dot ${a.status === 'success' ? 'dot-success' : 'dot-info'}`}>
                        {a.status === 'success' ? '✅' : '🔍'}
                      </div>
                      <div className="activity-body">
                        <p>
                          <strong>{a.university?.name || 'System'}</strong> — Verification for{' '}
                          <strong>{a.searched_name}</strong> ({a.searched_degree})
                          {' '}<span className={`status-pill ${a.status === 'success' ? 'status-active' : 'status-inactive'}`}>{a.result?.replace('_', ' ')}</span>
                        </p>
                        <span className="activity-time">
                          {new Date(a.created_at).toLocaleString()}
                          {a.organization_name && ` · by ${a.organization_name}`}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <>
                      {[
                        { dot: 'dot-success', icon: '✅', text: <><strong>University of Medicine 1</strong> uploaded 100 new student records</>, time: '2 hours ago' },
                        { dot: 'dot-info',    icon: '👤', text: <><strong>New admin user</strong> was created for Technological University</>, time: '5 hours ago' },
                        { dot: 'dot-warning', icon: '⚠️', text: <><strong>Yangon University</strong> status changed to inactive</>, time: '1 day ago' },
                      ].map((a, i) => (
                        <div className="activity-item" key={i}>
                          <div className={`activity-dot ${a.dot}`}>{a.icon}</div>
                          <div className="activity-body">
                            <p>{a.text}</p>
                            <span className="activity-time">{a.time}</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── UNIVERSITIES ── */}
          {tab === 'universities' && (
            <div className="table-card">
              <div className="table-card-header">
                <div className="table-search">
                  <span>🔍</span>
                  <input placeholder="Search universities..." value={uniSearch} onChange={e => setUniSearch(e.target.value)} />
                </div>
                <button className="btn-add" onClick={openAddUni}>＋ Add University</button>
              </div>
              <table className="sd-table">
                <thead>
                  <tr>
                    <th>#</th><th>University Name</th><th>Location</th>
                    <th>Students</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnis.length === 0
                    ? <tr><td colSpan={6}><div className="empty-state"><span>🏛️</span><p>No universities found</p></div></td></tr>
                    : filteredUnis.map((u, i) => (
                      <tr key={u.id}>
                        <td>{i + 1}</td>
                        <td className="td-primary">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {u.logo_url ? <img src={u.logo_url} style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 4 }} alt="" /> : '🏛️'}
                            {u.name}
                          </div>
                        </td>
                        <td>📍 {u.location}</td>
                        <td>{u.students_count?.toLocaleString() ?? '—'}</td>
                        <td>
                          <span className={`status-pill ${u.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>
                          <button className="action-btn action-edit"   onClick={() => openEditUni(u)}>✏️ Edit</button>
                          <button className="action-btn action-delete" onClick={() => deleteUni(u.id)}>🗑️ Delete</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === 'users' && (
            <div className="table-card">
              <div className="table-card-header">
                <div className="table-search">
                  <span>🔍</span>
                  <input placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                </div>
                <button className="btn-add" onClick={openAddUser}>＋ Add User</button>
              </div>
              <table className="sd-table">
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Email</th><th>Role</th>
                    <th>University</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0
                    ? <tr><td colSpan={6}><div className="empty-state"><span>👥</span><p>No users found</p></div></td></tr>
                    : filteredUsers.map((u, i) => (
                      <tr key={u.id}>
                        <td>{i + 1}</td>
                        <td className="td-primary">{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`status-pill ${u.role === 'super_admin' ? 'status-active' : 'status-inactive'}`}>
                            {u.role === 'super_admin' ? '👑 Super Admin' : '🏛️ Uni Admin'}
                          </span>
                        </td>
                        <td>{u.university?.name || '—'}</td>
                        <td>
                          <button className="action-btn action-edit"   onClick={() => openEditUser(u)}>✏️ Edit</button>
                          <button className="action-btn action-delete" onClick={() => deleteUser(u.id)}>🗑️ Delete</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {tab === 'analytics' && (
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>📊 Monthly Verifications</h3>
                <div className="bar-chart">
                  {barData.map(b => (
                    <div className="bar-row" key={b.label}>
                      <span className="bar-label">{b.label}</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${(b.value / 1100) * 100}%` }} />
                      </div>
                      <span className="bar-value">{b.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-card">
                <h3>🏆 Top by Verifications</h3>
                <div className="rank-list">
                  {[
                    { name: 'University of Medicine 1',       count: '2,450' },
                    { name: 'Technological University',        count: '1,890' },
                    { name: 'University of Computer Studies', count: '1,320' },
                    { name: 'Yangon University',              count: '890' },
                  ].map((r, i) => (
                    <div className="rank-item" key={i}>
                      <div className={`rank-num rank-${i < 3 ? i + 1 : 'n'}`}>{i + 1}</div>
                      <span className="rank-name">{r.name}</span>
                      <span className="rank-value">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === 'settings' && (
            <div className="settings-grid">
              <div className="settings-card">
                <h3>⚙️ System Configuration</h3>
                {[
                  { label: 'System Name',          key: 'name',    val: 'University Verification System' },
                  { label: 'Admin Email',           key: 'email',   val: 'admin@system.com' },
                  { label: 'Verification Timeout (min)', key: 'timeout', val: '30' },
                  { label: 'Max Search Results',   key: 'maxres',  val: '10' },
                ].map(f => (
                  <div className="settings-field" key={f.key}>
                    <label>{f.label}</label>
                    <input className="settings-input" defaultValue={f.val} />
                  </div>
                ))}
                <button className="btn-save">💾 Save Configuration</button>
              </div>

              <div className="settings-card">
                <h3>🔔 Notification Settings</h3>
                {[
                  { label: 'Email on failed verification', sub: 'Send email alert when verification fails', def: true },
                  { label: 'New university registration',  sub: 'Notify on new university additions',       def: true },
                  { label: 'Bulk upload alerts',           sub: 'Alert after bulk student CSV upload',      def: false },
                  { label: 'Daily summary report',         sub: 'Receive daily stats digest email',         def: true },
                ].map((t, i) => (
                  <div className="toggle-row" key={i}>
                    <div className="toggle-info">
                      <p>{t.label}</p>
                      <span>{t.sub}</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked={t.def} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
                <button className="btn-save">💾 Save Notifications</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── University Modal ── */}
      {uniModal && (
        <div className="modal-overlay" onClick={() => setUniModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editUni ? '✏️ Edit University' : '＋ Add University'}</span>
              <button className="modal-close" onClick={() => setUniModal(false)}>✕</button>
            </div>
            <div className="modal-form">
              <div className="modal-form-row">
                <div className="form-group">
                  <label>University Name *</label>
                  <input className="modal-input" value={uniForm.name} onChange={e => setUF('name', e.target.value)} placeholder="e.g. University of Medicine 1" required />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input className="modal-input" value={uniForm.location} onChange={e => setUF('location', e.target.value)} placeholder="e.g. Yangon" required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input className="modal-input" value={uniForm.description} onChange={e => setUF('description', e.target.value)} placeholder="Short description..." />
              </div>
              <div className="form-group">
                <label>Logo URL (Optional)</label>
                <input className="modal-input" value={uniForm.logo_url} onChange={e => setUF('logo_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="modal-input" value={uniForm.status} onChange={e => setUF('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setUniModal(false)}>Cancel</button>
              <button className="btn-modal-submit" onClick={saveUni}>
                {editUni ? '💾 Save Changes' : '＋ Create University'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── User Modal ── */}
      {userModal && (
        <div className="modal-overlay" onClick={() => setUserModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editUser ? '✏️ Edit User' : '＋ Add User'}</span>
              <button className="modal-close" onClick={() => setUserModal(false)}>✕</button>
            </div>
            <div className="modal-form">
              <div className="modal-form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="modal-input" value={userForm.name} onChange={e => setUsr('name', e.target.value)} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input className="modal-input" type="email" value={userForm.email} onChange={e => setUsr('email', e.target.value)} placeholder="email@example.com" />
                </div>
              </div>
              <div className="modal-form-row">
                <div className="form-group">
                  <label>Password {editUser ? '(leave blank to keep)' : '*'}</label>
                  <input className="modal-input" type="password" value={userForm.password} onChange={e => setUsr('password', e.target.value)} placeholder="Min. 8 characters" />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select className="modal-input" value={userForm.role} onChange={e => setUsr('role', e.target.value)}>
                    <option value="university_admin">University Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              {userForm.role === 'university_admin' && (
                <div className="form-group">
                  <label>Assign University *</label>
                  <select className="modal-input" value={userForm.university_id} onChange={e => setUsr('university_id', e.target.value)}>
                    <option value="">-- Select University --</option>
                    {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setUserModal(false)}>Cancel</button>
              <button className="btn-modal-submit" onClick={saveUser}>
                {editUser ? '💾 Save Changes' : '＋ Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
