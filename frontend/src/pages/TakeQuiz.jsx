import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

export const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const timerRef = useRef(null);
  const autoSubmitTriggered = useRef(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes/${id}`);
        if (!res.ok) {
          setError('Quiz not found or unauthorized.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!data.questions || data.questions.length === 0) {
          setError('This quiz does not have any questions yet.');
          setLoading(false);
          return;
        }
        setQuiz(data);
        setTimeLeft(data.timeLimitInMinutes * 60);
      } catch (err) {
        setError('Network error. Failed to load quiz details.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  // Handle countdown timer
  useEffect(() => {
    if (loading || !quiz || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!autoSubmitTriggered.current) {
            autoSubmitTriggered.current = true;
            submitQuizAttempt(true); // Auto submit
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, quiz, timeLeft]);

  const selectOption = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const submitQuizAttempt = async (isAuto = false) => {
    setSubmitting(true);
    setShowConfirmModal(false);

    // Format answers map for backend
    const formattedAnswers = {};
    if (quiz) {
      quiz.questions.forEach((q) => {
        formattedAnswers[`question_${q.id}`] = answers[q.id] || '';
      });
    }

    try {
      const res = await fetch(`/api/submissions/quiz/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedAnswers),
      });

      if (res.ok) {
        const data = await res.json();
        navigate(`/submissions/${data.id}`, { state: { justSubmitted: true, autoSubmitted: isAuto } });
      } else {
        setError('Failed to submit exam. Contact administrator.');
        setSubmitting(false);
      }
    } catch (err) {
      setError('Network error during submission. Try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="main-content" style={{ textAlign: 'center', padding: '3rem' }}>Loading examination details...</div>;
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="alert alert-danger" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/quizzes')}>Return to Available Exams</button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="main-content">
      {/* Timer & Info Row */}
      <div className="quiz-header">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{quiz.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Answer all questions. Once submitted, you cannot edit your answers.
          </p>
        </div>

        <div className="timer-box">
          <Clock size={18} />
          <span>Time Remaining: {formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Questions Stack */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {quiz.questions.map((question, index) => {
          const selected = answers[question.id] || '';
          return (
            <div className="question-block" key={question.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div className="question-number">Question {index + 1} of {quiz.questions.length}</div>
                {question.marks !== undefined && (
                  <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
                    {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                  </span>
                )}
              </div>
              <div className="question-text">{question.content}</div>

              <div className="options-list">
                {[
                  { key: 'A', text: question.optionA },
                  { key: 'B', text: question.optionB },
                  { key: 'C', text: question.optionC },
                  { key: 'D', text: question.optionD },
                ].map((opt) => (
                  <div 
                    key={opt.key}
                    className={`option-item ${selected === opt.key ? 'selected' : ''}`}
                    onClick={() => selectOption(question.id, opt.key)}
                  >
                    <div className="option-marker">{opt.key}</div>
                    <div className="option-text">{opt.text}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/quizzes')}>Cancel Attempt</button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting}
          >
            <span>Finish & Submit</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={24} style={{ color: 'var(--color-warning)' }} />
              <span>Submit Exam?</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Are you sure you want to finish and submit your exam? You have answered{' '}
              <strong>{Object.keys(answers).length}</strong> out of <strong>{quiz.questions.length}</strong> questions.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowConfirmModal(false)}>Resume Quiz</button>
              <button className="btn btn-primary btn-sm" onClick={() => submitQuizAttempt(false)} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
