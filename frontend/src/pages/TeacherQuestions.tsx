import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Edit2, Trash2, HelpCircle, Save, X, Check } from 'lucide-react';

interface Question {
  id: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  marks: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
}

export const TeacherQuestions: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states (for Add & Edit)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    marks: 1.0,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [quizRes, qRes] = await Promise.all([
        fetch(`/api/quizzes/${quizId}`),
        fetch(`/api/teacher/quizzes/${quizId}/questions`)
      ]);

      if (quizRes.ok) {
        setQuiz(await quizRes.json());
      }
      if (qRes.ok) {
        setQuestions(await qRes.json());
      } else {
        setError('Failed to fetch questions list.');
      }
    } catch (err) {
      setError('Network error. Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.name === 'marks' ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      content: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 1.0,
    });
    setEditingQuestion(null);
    setFormError(null);
  };

  const handleEditClick = (q: Question) => {
    setEditingQuestion(q);
    setFormData({
      content: q.content,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1.0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const url = editingQuestion 
        ? `/api/teacher/questions/${editingQuestion.id}`
        : `/api/teacher/quizzes/${quizId}/questions`;
      const method = editingQuestion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const savedQ = await res.json();
        if (editingQuestion) {
          setQuestions(questions.map(q => q.id === editingQuestion.id ? savedQ : q));
        } else {
          setQuestions([...questions, savedQ]);
        }
        resetForm();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to save question.');
      }
    } catch (err) {
      setFormError('Network error. Failed to submit question.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const res = await fetch(`/api/teacher/questions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setQuestions(questions.filter(q => q.id !== id));
      } else {
        setError('Failed to delete question.');
      }
    } catch (err) {
      setError('Network error. Failed to delete question.');
    }
  };

  if (loading) {
    return <div className="main-content" style={{ textAlign: 'center', padding: '3rem' }}>Loading questions bank...</div>;
  }

  return (
    <div className="main-content">
      <button 
        className="btn btn-secondary btn-sm"
        onClick={() => navigate('/teacher/quizzes')}
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Quizzes</span>
      </button>

      {quiz && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            Questions: {quiz.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage multiple-choice questions, verify answer keys, and update content.</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Questions list */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Current Questions ({questions.length})
          </h3>

          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <HelpCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No questions added to this quiz yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {questions.map((q, index) => (
                <div className="question-block" key={q.id} style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="question-number">Question {index + 1}</span>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                        {q.marks || 1.0} {(q.marks || 1.0) === 1 ? 'mark' : 'marks'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleEditClick(q)}
                        style={{ padding: '0.3rem 0.6rem' }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleDelete(q.id)}
                        style={{ padding: '0.3rem 0.6rem' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="question-text" style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>{q.content}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { key: 'A', text: q.optionA },
                      { key: 'B', text: q.optionB },
                      { key: 'C', text: q.optionC },
                      { key: 'D', text: q.optionD },
                    ].map((opt) => {
                      const isCorrect = q.correctAnswer === opt.key;
                      return (
                        <div 
                          key={opt.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-tertiary)',
                            border: isCorrect ? '1px solid var(--color-success)' : '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.9rem',
                            color: isCorrect ? '#ffffff' : 'var(--text-secondary)'
                          }}
                        >
                          <span style={{ fontWeight: 700, color: isCorrect ? 'var(--color-success)' : 'var(--text-muted)' }}>{opt.key}.</span>
                          <span>{opt.text}</span>
                          {isCorrect && <Check size={14} style={{ color: 'var(--color-success)', marginLeft: 'auto' }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Add/Edit form */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div className="form-card" style={{ margin: 0, maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h3>
              {editingQuestion && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={resetForm}
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {formError && (
              <div className="alert alert-danger" style={{ padding: '0.75rem 1rem' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Question Text</label>
                <textarea 
                  name="content"
                  rows={3}
                  className="form-control"
                  placeholder="e.g. Which of the following is not a primitive type in Java?"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Option A</label>
                <input 
                  name="optionA"
                  type="text" 
                  className="form-control"
                  placeholder="Option A"
                  value={formData.optionA}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Option B</label>
                <input 
                  name="optionB"
                  type="text" 
                  className="form-control"
                  placeholder="Option B"
                  value={formData.optionB}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Option C</label>
                <input 
                  name="optionC"
                  type="text" 
                  className="form-control"
                  placeholder="Option C"
                  value={formData.optionC}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Option D</label>
                <input 
                  name="optionD"
                  type="text" 
                  className="form-control"
                  placeholder="Option D"
                  value={formData.optionD}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Correct Option</label>
                  <select 
                    name="correctAnswer"
                    className="form-control form-select"
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Marks</label>
                  <input 
                    name="marks"
                    type="number"
                    min={0.5}
                    max={100}
                    step="0.5"
                    className="form-control"
                    value={formData.marks}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                style={{ marginTop: '1rem' }}
                disabled={formLoading}
              >
                <Save size={16} />
                <span>{editingQuestion ? 'Update Question' : 'Save Question'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
