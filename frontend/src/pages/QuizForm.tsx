import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Save, ArrowLeft } from 'lucide-react';

export const QuizForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimitInMinutes: 30,
    passPercentage: 60.0,
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchQuizDetails = async () => {
      try {
        const res = await fetch(`/api/quizzes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            title: data.title,
            description: data.description || '',
            timeLimitInMinutes: data.timeLimitInMinutes,
            passPercentage: data.passPercentage,
          });
        } else {
          setError('Failed to load quiz details.');
        }
      } catch (err) {
        setError('Network error. Failed to load quiz details.');
      } finally {
        setFetching(false);
      }
    };

    fetchQuizDetails();
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'timeLimitInMinutes' || e.target.name === 'passPercentage'
      ? parseFloat(e.target.value)
      : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isEditMode ? `/api/quizzes/teacher/${id}` : '/api/quizzes/teacher';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        navigate('/teacher/quizzes');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save quiz settings.');
      }
    } catch (err) {
      setError('Network error. Failed to submit form.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="main-content" style={{ textAlign: 'center', padding: '3rem' }}>Loading quiz configuration...</div>;
  }

  return (
    <div className="main-content">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/teacher/quizzes')}
          style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Quizzes</span>
        </button>

        <div className="form-card" style={{ margin: 0, maxWidth: '100%' }}>
          <h1 className="form-title" style={{ textAlign: 'left' }}>
            {isEditMode ? 'Edit Quiz Config' : 'Create New Quiz'}
          </h1>
          <p className="form-subtitle" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            Set titles, instructions, time limit boundaries, and grading pass marks.
          </p>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Quiz Title</label>
              <input 
                id="title"
                name="title"
                type="text" 
                className="form-control"
                placeholder="e.g. Midterm Java Programming"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description / Instructions</label>
              <textarea 
                id="description"
                name="description"
                rows={4}
                className="form-control"
                placeholder="Specify target audience, guidelines, rules..."
                value={formData.description}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="timeLimitInMinutes">Time Limit (mins)</label>
                <input 
                  id="timeLimitInMinutes"
                  name="timeLimitInMinutes"
                  type="number" 
                  min={1}
                  className="form-control"
                  value={formData.timeLimitInMinutes}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="passPercentage">Passing Score (%)</label>
                <input 
                  id="passPercentage"
                  name="passPercentage"
                  type="number" 
                  min={1}
                  max={100}
                  step="0.5"
                  className="form-control"
                  value={formData.passPercentage}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              style={{ marginTop: '1.5rem' }}
              disabled={loading}
            >
              <Save size={18} />
              <span>{loading ? 'Saving Settings...' : 'Save Configuration'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
