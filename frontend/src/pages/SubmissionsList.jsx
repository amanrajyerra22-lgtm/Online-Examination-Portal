import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Search, Calendar, Eye, ClipboardList } from 'lucide-react';

export const SubmissionsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [passedFilter, setPassedFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    const fetchSubmissions = async () => {
      try {
        const url = user.role === 'STUDENT' ? '/api/submissions/history' : '/api/submissions/teacher';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // Sort by date descending
          data.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
          setSubmissions(data);
        } else {
          setError('Failed to retrieve submissions logs.');
        }
      } catch (err) {
        setError('Network error. Failed to load attempts history.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  if (!user) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  // Filter logic
  const filteredSubmissions = submissions.filter((sub) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      sub.quizTitle.toLowerCase().includes(term) ||
      (sub.studentName && sub.studentName.toLowerCase().includes(term)) ||
      (sub.studentEmail && sub.studentEmail.toLowerCase().includes(term));
      
    const matchesPass = 
      passedFilter === 'all' ||
      (passedFilter === 'passed' && sub.passed) ||
      (passedFilter === 'failed' && !sub.passed);

    return matchesSearch && matchesPass;
  });

  return (
    <div className="main-content">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          {user.role === 'STUDENT' ? 'My Exam History' : 'Student Submissions Logs'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {user.role === 'STUDENT' 
            ? 'Track your performance scorecards and review details of completed exams.' 
            : 'Monitor student attempts, grades, passing rates, and individual answer sheets.'
          }
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading submissions logs...</div>
      ) : error ? (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <ClipboardList size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No exam submissions found.</p>
        </div>
      ) : (
        <div className="table-container">
          {/* Controls Bar */}
          <div className="table-controls">
            <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: '1 1 280px', maxWidth: '400px', position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder={user.role === 'STUDENT' ? "Search by exam title..." : "Search student or exam title..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
                <select 
                  className="form-control form-select"
                  value={passedFilter}
                  onChange={(e) => setPassedFilter(e.target.value)}
                 >
                  <option value="all">All Results</option>
                  <option value="passed">Passed Attempts</option>
                  <option value="failed">Failed Attempts</option>
                </select>
              </div>
            </div>

            <div style={{ color: 'var(--text-secondary)', alignSelf: 'center', fontSize: '0.9rem' }}>
              Showing <strong>{filteredSubmissions.length}</strong> of <strong>{submissions.length}</strong> logs
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  {user.role !== 'STUDENT' && <th>Student</th>}
                  <th>Exam Title</th>
                  <th>Attempt Date</th>
                  <th>Score</th>
                  <th>Passed?</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    {user.role !== 'STUDENT' && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{sub.studentName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub.studentEmail}</div>
                      </td>
                    )}
                    <td style={{ fontWeight: 600 }}>{sub.quizTitle}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        <span>{formatDate(sub.submissionDate)}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>{Math.round(sub.score)}%</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {sub.correctAnswers} / {sub.totalQuestions} correct
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${sub.passed ? 'badge-success' : 'badge-danger'}`}>
                        {sub.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => navigate(`/submissions/${sub.id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
                      >
                        <Eye size={12} />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
