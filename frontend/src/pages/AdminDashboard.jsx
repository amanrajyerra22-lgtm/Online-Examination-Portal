import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Search, Edit3, Trash2, Shield, Users, Award, ClipboardList, RefreshCw, X, Calendar, Save, Plus, BookOpen } from 'lucide-react';

export const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [quizSearchTerm, setQuizSearchTerm] = useState('');
  const [quizDeleteTarget, setQuizDeleteTarget] = useState(null);
  const [quizDeleting, setQuizDeleting] = useState(false);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals state
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'STUDENT',
    password: '',
  });
  const [editError, setEditError] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const [scoreUser, setScoreUser] = useState(null);
  const [scoreList, setScoreList] = useState([]);
  const [scoreLoading, setScoreLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        setUsers(await res.json());
      } else {
        setError('Failed to retrieve user directory.');
      }
    } catch (err) {
      setError('Network error. Failed to load users.');
    }
  };

  const fetchAllQuizzes = async () => {
    setQuizzesLoading(true);
    try {
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        setQuizzes(await res.json());
      }
    } catch (err) {
      console.error('Failed to load quizzes', err);
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleQuizDelete = async () => {
    if (!quizDeleteTarget) return;
    setQuizDeleting(true);
    try {
      const res = await fetch(`/api/quizzes/teacher/${quizDeleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setQuizzes(quizzes.filter(q => q.id !== quizDeleteTarget.id));
        setQuizDeleteTarget(null);
        fetchStats();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to delete quiz.');
      }
    } catch (err) {
      alert('Network error. Failed to delete quiz.');
    } finally {
      setQuizDeleting(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchStats(), fetchUsers(), fetchAllQuizzes()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (u) => {
    setEditingUser(u);
    setEditFormData({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email,
      role: u.role,
      password: '', // Leave blank
    });
    setEditError(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditSaving(true);
    setEditError(null);

    // Filter out blank password
    const payload = {
      firstName: editFormData.firstName,
      lastName: editFormData.lastName,
      email: editFormData.email,
      role: editFormData.role,
    };
    if (editFormData.password.trim()) {
      payload.password = editFormData.password.trim();
    }

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u.id === editingUser.id ? updated : u));
        setEditingUser(null);
        fetchStats(); // Update stats in case role changed
      } else {
        const errData = await res.json();
        setEditError(errData.error || 'Failed to update user profile.');
      }
    } catch (err) {
      setEditError('Network error. Failed to save changes.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleScoreClick = async (u) => {
    setScoreUser(u);
    setScoreLoading(true);
    setScoreList([]);

    try {
      const res = await fetch(`/api/admin/users/${u.id}/submissions`);
      if (res.ok) {
        setScoreList(await res.json());
      }
    } catch (err) {
      console.error('Failed to load user submissions', err);
    } finally {
      setScoreLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== deleteTarget.id));
        setDeleteTarget(null);
        loadData(); // Reload stats and user counts
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to delete user.');
      }
    } catch (err) {
      alert('Network error. Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      u.email.toLowerCase().includes(term) ||
      (u.firstName && u.firstName.toLowerCase().includes(term)) ||
      (u.lastName && u.lastName.toLowerCase().includes(term));
      
    const matchesRole = roleFilter === '' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Filtered quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    const term = quizSearchTerm.toLowerCase().trim();
    return (
      q.title.toLowerCase().includes(term) ||
      (q.description && q.description.toLowerCase().includes(term)) ||
      (q.createdBy && q.createdBy.toLowerCase().includes(term))
    );
  });

  return (
    <div className="main-content">
      {/* Page Title */}
      <div className="dashboard-title-row">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={28} style={{ color: '#a855f7' }} />
            <span>Admin Control Panel</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>System statistics, global registration database control, and score audits.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
          <RefreshCw size={16} />
          <span>Reload Logs</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Users size={20} /></div>
            <div className="stat-info">
              <span className="stat-num">{stats.totalUsers}</span>
              <span className="stat-lbl">Registered Users</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><ClipboardList size={20} style={{ color: 'var(--accent-secondary)' }} /></div>
            <div className="stat-info">
              <span className="stat-num">{stats.totalQuizzes}</span>
              <span className="stat-lbl">Active Quizzes</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Award size={20} style={{ color: 'var(--color-success)' }} /></div>
            <div className="stat-info">
              <span className="stat-num">{stats.totalSubmissions}</span>
              <span className="stat-lbl">Exam Attempts</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Award size={20} style={{ color: 'var(--color-warning)' }} /></div>
            <div className="stat-info">
              <span className="stat-num">{Math.round(stats.passRate)}%</span>
              <span className="stat-lbl">Passing Rate</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switcher Headers */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', marginTop: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('users')} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid #a855f7' : '2px solid transparent',
            color: activeTab === 'users' ? 'white' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '1rem'
          }}
        >
          <Users size={16} />
          <span>User Accounts Directory</span>
        </button>
        <button 
          onClick={() => setActiveTab('quizzes')} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'quizzes' ? '2px solid #a855f7' : '2px solid transparent',
            color: activeTab === 'quizzes' ? 'white' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '1rem'
          }}
        >
          <BookOpen size={16} />
          <span>Quiz Repository Manager</span>
        </button>
      </div>

      {activeTab === 'users' ? (
        /* Directory Table */
        <div className="table-container">
          <div className="table-controls">
            <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: '1 1 280px', maxWidth: '400px', position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
                <select 
                  className="form-control form-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="STUDENT">Students</option>
                  <option value="TEACHER">Teachers</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
            </div>

            <div style={{ color: 'var(--text-secondary)', alignSelf: 'center', fontSize: '0.9rem' }}>
              Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> accounts
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading user directory...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Account Role</th>
                    <th style={{ width: '220px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{u.id}</td>
                      <td style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-success' : u.role === 'TEACHER' ? 'badge-info' : 'badge-warning'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {u.role === 'STUDENT' && (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleScoreClick(u)}
                            >
                              Scores
                            </button>
                          )}
                          
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleEditClick(u)}
                            style={{ padding: '0.4rem' }}
                          >
                            <Edit3 size={14} />
                          </button>

                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => setDeleteTarget(u)}
                            style={{ padding: '0.4rem' }}
                            disabled={currentUser?.id === u.id}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Quizzes Table */
        <div className="table-container">
          <div className="table-controls" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: '1 1 280px', maxWidth: '400px', position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Search quizzes by title, description or teacher..."
                  value={quizSearchTerm}
                  onChange={(e) => setQuizSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/teacher/quizzes/create')}>
                <Plus size={16} />
                <span>Create Quiz</span>
              </button>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Showing <strong>{filteredQuizzes.length}</strong> of <strong>{quizzes.length}</strong> quizzes
              </div>
            </div>
          </div>

          {quizzesLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading quiz repository...</div>
          ) : quizzes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No quizzes currently exist in the database.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Quiz Title</th>
                    <th>Creator</th>
                    <th>Time Limit</th>
                    <th>Passing Score</th>
                    <th>Questions</th>
                    <th style={{ width: '280px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((q) => (
                    <tr key={q.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{q.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{q.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {q.description || 'No description.'}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{q.createdBy || 'Teacher'}</td>
                      <td>{q.timeLimitInMinutes} mins</td>
                      <td>{q.passPercentage}%</td>
                      <td>
                        <span className="badge badge-info">{q.questionCount || 0} Qs</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/teacher/quizzes/${q.id}/questions`)}
                          >
                            Questions
                          </button>
                          
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => navigate(`/teacher/quizzes/edit/${q.id}`)}
                            style={{ padding: '0.4rem' }}
                            title="Edit Details"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => setQuizDeleteTarget(q)}
                            style={{ padding: '0.4rem' }}
                            title="Delete Quiz"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Modify Account Profile</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingUser(null)} style={{ padding: '0.25rem 0.5rem' }}>
                <X size={16} />
              </button>
            </div>

            {editError && (
              <div className="alert alert-danger" style={{ padding: '0.75rem' }}>
                <AlertCircle size={16} />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select 
                  className="form-control form-select"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  required
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">New Password (leave empty to keep current)</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="••••••••"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} disabled={editSaving}>
                <Save size={16} />
                <span>{editSaving ? 'Updating...' : 'Save User Settings'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Scores View Modal */}
      {scoreUser !== null && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                Attempts: {scoreUser.firstName} {scoreUser.lastName}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setScoreUser(null)} style={{ padding: '0.25rem 0.5rem' }}>
                <X size={16} />
              </button>
            </div>

            {scoreLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading submissions...</div>
            ) : scoreList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <Plus size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                <p>This student hasn't submitted any exams yet.</p>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ minWidth: '100%' }}>
                  <thead>
                    <tr>
                      <th>Exam Name</th>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreList.map((score) => (
                      <tr key={score.id}>
                        <td style={{ fontWeight: 600 }}>{score.quizTitle}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <Calendar size={12} />
                            <span>{formatDate(score.submissionDate)}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700 }}>{Math.round(score.score)}%</td>
                        <td>
                          <span className={`badge ${score.passed ? 'badge-success' : 'badge-danger'}`}>
                            {score.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setScoreUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteTarget !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Delete Account Profile?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete the user account <strong>{deleteTarget.firstName} {deleteTarget.lastName} ({deleteTarget.email})</strong>?
              This will remove all associated statistics, exam submissions, and student scores logs permanently.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting Account...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quiz Modal */}
      {quizDeleteTarget !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Delete Quiz?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete the quiz <strong>{quizDeleteTarget.title}</strong>?
              This will permanently remove the quiz, all of its questions, and all student submissions associated with it.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setQuizDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleQuizDelete} disabled={quizDeleting}>
                {quizDeleting ? 'Deleting Quiz...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
