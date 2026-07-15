import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Award } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="nav-header">
      <div className="nav-inner">
        <div className="nav-brand" onClick={() => navigate('/dashboard')}>
          <Award size={28} style={{ color: '#a855f7' }} />
          <span>VidyaSetu</span>
        </div>

        <nav className="nav-items">
          <span 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </span>

          {user.role === 'STUDENT' && (
            <>
              <span 
                className={`nav-link ${isActive('/quizzes') ? 'active' : ''}`}
                onClick={() => navigate('/quizzes')}
              >
                Take Exam
              </span>
              <span 
                className={`nav-link ${isActive('/history') ? 'active' : ''}`}
                onClick={() => navigate('/history')}
              >
                My History
              </span>
            </>
          )}

          {(user.role === 'TEACHER' || user.role === 'ADMIN') && (
            <>
              <span 
                className={`nav-link ${isActive('/teacher/quizzes') ? 'active' : ''}`}
                onClick={() => navigate('/teacher/quizzes')}
              >
                Manage Quizzes
              </span>
              <span 
                className={`nav-link ${isActive('/teacher/submissions') ? 'active' : ''}`}
                onClick={() => navigate('/teacher/submissions')}
              >
                Submissions
              </span>
            </>
          )}

          {user.role === 'ADMIN' && (
            <span 
              className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
              onClick={() => navigate('/admin/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#c084fc' }}
            >
              <Shield size={16} /> Admin Panel
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
            <span className="user-tag">
              <User size={14} />
              <span>{user.firstName} ({user.role})</span>
            </span>

            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleLogout}
              style={{ padding: '0.4rem 0.8rem' }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
