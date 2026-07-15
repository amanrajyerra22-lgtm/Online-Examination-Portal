import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { QuizList } from './pages/QuizList';
import { TakeQuiz } from './pages/TakeQuiz';
import { QuizResult } from './pages/QuizResult';
import { SubmissionsList } from './pages/SubmissionsList';
import { TeacherQuizzes } from './pages/TeacherQuizzes';
import { QuizForm } from './pages/QuizForm';
import { TeacherQuestions } from './pages/TeacherQuestions';
import { AdminDashboard } from './pages/AdminDashboard';

// Route guards
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Restoring secure session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Restoring secure session...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Private Shared Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/submissions/:id" element={<PrivateRoute><QuizResult /></PrivateRoute>} />

        {/* Student Routes */}
        <Route path="/quizzes" element={<PrivateRoute allowedRoles={['STUDENT']}><QuizList /></PrivateRoute>} />
        <Route path="/quizzes/:id/take" element={<PrivateRoute allowedRoles={['STUDENT']}><TakeQuiz /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute allowedRoles={['STUDENT']}><SubmissionsList /></PrivateRoute>} />

        {/* Teacher / Admin Routes */}
        <Route path="/teacher/quizzes" element={<PrivateRoute allowedRoles={['TEACHER', 'ADMIN']}><TeacherQuizzes /></PrivateRoute>} />
        <Route path="/teacher/quizzes/create" element={<PrivateRoute allowedRoles={['TEACHER', 'ADMIN']}><QuizForm /></PrivateRoute>} />
        <Route path="/teacher/quizzes/edit/:id" element={<PrivateRoute allowedRoles={['TEACHER', 'ADMIN']}><QuizForm /></PrivateRoute>} />
        <Route path="/teacher/quizzes/:quizId/questions" element={<PrivateRoute allowedRoles={['TEACHER', 'ADMIN']}><TeacherQuestions /></PrivateRoute>} />
        <Route path="/teacher/submissions" element={<PrivateRoute allowedRoles={['TEACHER', 'ADMIN']}><SubmissionsList /></PrivateRoute>} />

        {/* Admin Specific Routes */}
        <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
