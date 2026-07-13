import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit3, Trash2, HelpCircle, AlertCircle, Clock, ListChecks } from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimitInMinutes: number;
  passPercentage: number;
  questionCount: number;
}

export const TeacherQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes/teacher');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      } else {
        setError('Failed to fetch quizzes list.');
      }
    } catch (err) {
      setError('Network error. Failed to load quizzes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    setDeleting(true);
    
    try {
      const res = await fetch(`/api/quizzes/teacher/${deleteTarget}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setQuizzes(quizzes.filter(q => q.id !== deleteTarget));
        setDeleteTarget(null);
      } else {
        setError('Failed to delete quiz.');
      }
    } catch (err) {
      setError('Network error. Failed to delete quiz.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="main-content">
      <div className="dashboard-title-row">
        <div>
          <h2>Manage Quizzes</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Create new examinations, manage question banks, and define guidelines.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/teacher/quizzes/create')}>
          <Plus size={18} />
          <span>Create Quiz</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <ListChecks size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>No quizzes created yet.</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/teacher/quizzes/create')}>Create Your First Quiz</button>
        </div>
      ) : (
        <div className="grid">
          {quizzes.map((quiz) => (
            <div className="card" key={quiz.id}>
              <div>
                <h3 className="card-title">{quiz.title}</h3>
                <p className="card-desc">{quiz.description || 'No description.'}</p>
              </div>

              <div>
                <div className="card-meta" style={{ marginBottom: '1.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} /> {quiz.timeLimitInMinutes} min
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <HelpCircle size={14} /> {quiz.questionCount} Questions
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
                    Pass: {quiz.passPercentage}%
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.5fr', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => navigate(`/teacher/quizzes/${quiz.id}/questions`)}
                  >
                    <span>Questions</span>
                  </button>
                  
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => navigate(`/teacher/quizzes/edit/${quiz.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Edit3 size={12} />
                    <span>Edit</span>
                  </button>
                  
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteTarget(quiz.id)}
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Delete Quiz?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Are you sure you want to delete this quiz? All associated questions, student submissions, and score history will be permanently deleted.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
