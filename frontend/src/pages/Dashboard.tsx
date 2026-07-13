import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ClipboardList, Shield, Users, BarChart3, Star, Award, CheckCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Stats state
  const [studentStats, setStudentStats] = useState({ taken: 0, avgScore: 0, passed: 0 });
  const [teacherStats, setTeacherStats] = useState({ created: 0, attempts: 0 });
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, totalQuizzes: 0, totalSubmissions: 0, passRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        if (user.role === 'STUDENT') {
          const res = await fetch('/api/submissions/history');
          if (res.ok) {
            const data = await res.json();
            const total = data.length;
            const avg = total > 0 ? data.reduce((acc: number, cur: any) => acc + cur.score, 0) / total : 0;
            const passed = data.filter((item: any) => item.passed).length;
            setStudentStats({ taken: total, avgScore: Math.round(avg), passed });
          }
        } else if (user.role === 'TEACHER') {
          const [quizRes, subRes] = await Promise.all([
            fetch('/api/quizzes/teacher'),
            fetch('/api/submissions/teacher')
          ]);
          let created = 0;
          let attempts = 0;
          if (quizRes.ok) {
            const quizzes = await quizRes.json();
            created = quizzes.length;
          }
          if (subRes.ok) {
            const subs = await subRes.json();
            attempts = subs.length; // Filter or show all
          }
          setTeacherStats({ created, attempts });
        } else if (user.role === 'ADMIN') {
          const res = await fetch('/api/admin/stats');
          if (res.ok) {
            const data = await res.json();
            setAdminStats(data);
          }
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (!user) return null;

  return (
    <div className="main-content">
      <div className="alert alert-success" style={{ background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))', border: '1px solid var(--border-color)', color: 'white' }}>
        <Award size={20} style={{ color: '#a855f7' }} />
        <div>
          <span style={{ fontWeight: 600 }}>Welcome back, {user.firstName}!</span> Logged in as <span style={{ color: '#c7d2fe', fontWeight: 600 }}>{user.role}</span>.
        </div>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your examinations, check results, and track progress here.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading statistics...</div>
      ) : (
        <>
          {/* 1. STUDENT DASHBOARD */}
          {user.role === 'STUDENT' && (
            <div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><BookOpen size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-num">{studentStats.taken}</span>
                    <span className="stat-lbl">Exams Taken</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><CheckCircle size={24} style={{ color: 'var(--color-success)' }} /></div>
                  <div className="stat-info">
                    <span className="stat-num">{studentStats.passed}</span>
                    <span className="stat-lbl">Exams Passed</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><BarChart3 size={24} style={{ color: 'var(--accent-secondary)' }} /></div>
                  <div className="stat-info">
                    <span className="stat-num">{studentStats.avgScore}%</span>
                    <span className="stat-lbl">Avg. Score</span>
                  </div>
                </div>
              </div>

              <div className="grid">
                <div className="card">
                  <div>
                    <h3 className="card-title">📝 Take Exam</h3>
                    <p className="card-desc">Browse through the list of active exams. Check durations and starting guidelines before attempting the quizzes.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => navigate('/quizzes')}>Available Quizzes</button>
                </div>

                <div className="card">
                  <div>
                    <h3 className="card-title">📊 Performance History</h3>
                    <p className="card-desc">Track your scores, view detailed reports of your past attempts, and see which questions you answered correctly.</p>
                  </div>
                  <button className="btn btn-secondary" onClick={() => navigate('/history')}>Exam History</button>
                </div>
              </div>
            </div>
          )}

          {/* 2. TEACHER DASHBOARD */}
          {user.role === 'TEACHER' && (
            <div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><ClipboardList size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-num">{teacherStats.created}</span>
                    <span className="stat-lbl">Quizzes Created</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Users size={24} style={{ color: 'var(--accent-secondary)' }} /></div>
                  <div className="stat-info">
                    <span className="stat-num">{teacherStats.attempts}</span>
                    <span className="stat-lbl">Total Submissions</span>
                  </div>
                </div>
              </div>

              <div className="grid">
                <div className="card">
                  <div>
                    <h3 className="card-title">📋 Quiz Management</h3>
                    <p className="card-desc">Create, update, and remove exams. Add multiple choice questions, set time limits, and set passing criteria.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => navigate('/teacher/quizzes')}>Manage Quizzes</button>
                </div>

                <div className="card">
                  <div>
                    <h3 className="card-title">✍️ Exam Submissions</h3>
                    <p className="card-desc">Check the list of all student submissions, view details of user answers, scores, and passing statuses.</p>
                  </div>
                  <button className="btn btn-secondary" onClick={() => navigate('/teacher/submissions')}>View Submissions</button>
                </div>
              </div>
            </div>
          )}

          {/* 3. ADMIN DASHBOARD */}
          {user.role === 'ADMIN' && (
            <div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><Users size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-num">{adminStats.totalUsers}</span>
                    <span className="stat-lbl">Total Registered Users</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><ClipboardList size={24} style={{ color: 'var(--accent-secondary)' }} /></div>
                  <div className="stat-info">
                    <span className="stat-num">{adminStats.totalQuizzes}</span>
                    <span className="stat-lbl">System Quizzes</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><BookOpen size={24} style={{ color: 'var(--color-success)' }} /></div>
                  <div className="stat-info">
                    <span className="stat-num">{adminStats.totalSubmissions}</span>
                    <span className="stat-lbl">Total Exam Attempts</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Star size={24} style={{ color: 'var(--color-warning)' }} /></div>
                  <div className="stat-info">
                    <span className="stat-num">{Math.round(adminStats.passRate)}%</span>
                    <span className="stat-lbl">Overall Pass Rate</span>
                  </div>
                </div>
              </div>

              <div className="grid">
                <div className="card" style={{ border: '1px solid rgba(168, 85, 247, 0.25)', background: 'rgba(19, 28, 49, 0.8)' }}>
                  <div>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc' }}>
                      <Shield size={22} /> System Admin Control Panel
                    </h3>
                    <p className="card-desc">Complete user oversight. Access user accounts list, update profiles, search records, delete unwanted users, and review stats.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => navigate('/admin/dashboard')}>Enter Admin Panel</button>
                </div>

                <div className="card">
                  <div>
                    <h3 className="card-title">📋 Global Quiz Editor</h3>
                    <p className="card-desc">Review and manage all quizzes in the database. Perform teacher tasks or delete invalid quizzes.</p>
                  </div>
                  <button className="btn btn-secondary" onClick={() => navigate('/teacher/quizzes')}>Manage All Quizzes</button>
                </div>

                <div className="card">
                  <div>
                    <h3 className="card-title">✍️ Review All Submissions</h3>
                    <p className="card-desc">Check attempt performance logs across all subjects. Review student exam results, scores, and pass statuses.</p>
                  </div>
                  <button className="btn btn-secondary" onClick={() => navigate('/teacher/submissions')}>View All Submissions</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
