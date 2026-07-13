import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Check, X, AlertCircle, RefreshCw, Home, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react';

interface UserAnswer {
  id: number;
  selectedAnswer: string;
  isCorrect: boolean;
  questionId: number;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  marks?: number;
}

interface Submission {
  id: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  submissionDate: string;
  studentName: string;
  studentEmail: string;
  quizTitle: string;
  quizId: number;
  userAnswers: UserAnswer[];
}

export const QuizResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check state from location (justSubmitted, autoSubmitted)
  const state = location.state as { justSubmitted?: boolean; autoSubmitted?: boolean } | null;

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await fetch(`/api/submissions/${id}`);
        if (res.ok) {
          const data = await res.json();
          setSubmission(data);
        } else if (res.status === 403) {
          setError('Unauthorized. You do not have permission to view this result.');
        } else {
          setError('Submission not found.');
        }
      } catch (err) {
        setError('Network error. Failed to load results.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  if (loading) {
    return <div className="main-content" style={{ textAlign: 'center', padding: '3rem' }}>Loading result reports...</div>;
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="alert alert-danger" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!submission) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="main-content">
      {state?.justSubmitted && (
        <div className="alert alert-success" style={{ maxWidth: '800px', margin: '0 auto 1.5rem auto' }}>
          <Check size={18} />
          <span>
            {state.autoSubmitted 
              ? 'Time limit expired! Your exam was automatically submitted successfully.' 
              : 'Your exam attempt has been submitted successfully.'
            }
          </span>
        </div>
      )}

      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        {/* Results Scoring Panel */}
        <div className="result-banner">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            {submission.passed ? (
              <ThumbsUp size={64} style={{ color: 'var(--color-success)' }} />
            ) : (
              <ThumbsDown size={64} style={{ color: 'var(--color-danger)' }} />
            )}
          </div>
          
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{submission.quizTitle}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Exam Performance Report</p>

          <div className="result-score">
            {Math.round(submission.score)}%
          </div>

          <div className={`result-status ${submission.passed ? 'passed' : 'failed'}`}>
            {submission.passed ? 'PASSED' : 'FAILED'}
          </div>

          <div className="result-details-grid">
            <div className="result-detail-item">
              <span className="result-detail-val">{submission.correctAnswers} / {submission.totalQuestions}</span>
              <span className="result-detail-lbl">Correct Answers</span>
            </div>
            <div className="result-detail-item" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem' }}>
              <span className="result-detail-val" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={16} />
                <span>{formatDate(submission.submissionDate).split(' at')[0]}</span>
              </span>
              <span className="result-detail-lbl">Submission Date</span>
            </div>
            <div className="result-detail-item" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem' }}>
              <span className="result-detail-val">{submission.studentName}</span>
              <span className="result-detail-lbl">Student Name</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            <Home size={16} />
            <span>Go to Dashboard</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/quizzes')}>
            <RefreshCw size={16} />
            <span>Available Exams</span>
          </button>
        </div>

        {/* Question Review Section */}
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Answer Review & Explanations
        </h3>

        {submission.userAnswers.map((ua, index) => {
          const isCorrect = ua.isCorrect;
          return (
            <div key={ua.id} className={`question-block ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="question-number">Question {index + 1}</span>
                  {ua.marks !== undefined && (
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
                      {ua.marks} {ua.marks === 1 ? 'mark' : 'marks'}
                    </span>
                  )}
                </div>
                <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>

              <div className="question-text" style={{ marginBottom: '1.5rem' }}>{ua.questionContent}</div>

              <div className="options-list" style={{ pointerEvents: 'none' }}>
                {[
                  { key: 'A', text: ua.optionA },
                  { key: 'B', text: ua.optionB },
                  { key: 'C', text: ua.optionC },
                  { key: 'D', text: ua.optionD },
                ].map((opt) => {
                  // Style adjustments for correct/incorrect highlighting
                  const isOptSelected = opt.key === ua.selectedAnswer;
                  const isOptCorrect = opt.key === ua.correctAnswer;
                  
                  let borderStyle = '1px solid var(--border-color)';
                  let bgStyle = 'var(--bg-tertiary)';
                  
                  if (isOptCorrect) {
                    borderStyle = '1px solid var(--color-success)';
                    bgStyle = 'rgba(16, 185, 129, 0.08)';
                  } else if (isOptSelected && !isCorrect) {
                    borderStyle = '1px solid var(--color-danger)';
                    bgStyle = 'rgba(239, 68, 68, 0.08)';
                  }

                  return (
                    <div 
                      key={opt.key}
                      className={`option-item`}
                      style={{ border: borderStyle, background: bgStyle }}
                    >
                      <div 
                        className="option-marker"
                        style={{
                          background: isOptCorrect ? 'var(--color-success)' : isOptSelected ? 'var(--color-danger)' : 'transparent',
                          borderColor: isOptCorrect ? 'var(--color-success)' : isOptSelected ? 'var(--color-danger)' : 'var(--text-muted)',
                          color: isOptCorrect || isOptSelected ? 'white' : 'var(--text-secondary)'
                        }}
                      >
                        {isOptCorrect ? <Check size={12} /> : isOptSelected ? <X size={12} /> : opt.key}
                      </div>
                      <div className="option-text" style={{ color: isOptCorrect ? '#ffffff' : 'var(--text-primary)' }}>{opt.text}</div>
                    </div>
                  );
                })}
              </div>

              <div className="review-answer-row">
                <div>
                  Your Choice: <strong style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)' }}>{ua.selectedAnswer || 'Skipped'}</strong>
                </div>
                <div>
                  Correct Option: <strong style={{ color: 'var(--color-success)' }}>{ua.correctAnswer}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
