import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, CheckSquare, User, BookOpen } from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimitInMinutes: number;
  passPercentage: number;
  questionCount: number;
  createdBy: string;
  attempted?: boolean;
  submissionId?: number;
}

export const QuizList: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch('/api/quizzes');
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data);
        } else {
          setError('Failed to fetch available quizzes.');
        }
      } catch (err) {
        setError('Network error. Failed to load quizzes.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="main-content">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Available Exams</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Select a quiz from the list below. Read the time constraints before starting.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading examinations...</div>
      ) : error ? (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : quizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No quizzes are currently available.</p>
        </div>
      ) : (
        <div className="grid">
          {quizzes.map((quiz) => (
            <div className="card" key={quiz.id}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="card-title">{quiz.title}</h3>
                  {quiz.attempted && (
                    <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>Completed</span>
                  )}
                </div>
                <p className="card-desc">{quiz.description || 'No description provided.'}</p>
              </div>

              <div>
                <div className="card-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} /> {quiz.timeLimitInMinutes} min
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckSquare size={14} /> {quiz.questionCount} Qs
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
                    <User size={14} /> By {quiz.createdBy || 'Teacher'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Passing threshold: <strong style={{ color: 'white' }}>{quiz.passPercentage}%</strong>
                  </span>
                  {quiz.attempted ? (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/submissions/${quiz.submissionId}`)}
                    >
                      View Result
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/quizzes/${quiz.id}/take`)}
                      disabled={quiz.questionCount === 0}
                    >
                      Take Exam
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
