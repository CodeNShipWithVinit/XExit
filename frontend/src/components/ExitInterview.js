import React, { useState, useEffect } from 'react';
import { resignationsAPI, exitInterviewsAPI } from '../services/api';

const ExitInterview = () => {
  const [resignations, setResignations] = useState([]);
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const questions = [
    { id: 'q1', question: 'What prompted you to start looking for another job?' },
    { id: 'q2', question: 'What was the best part about your job?' },
    { id: 'q3', question: 'What was the most challenging part of your job?' },
    { id: 'q4', question: 'Would you recommend this company to a friend? Why or why not?' },
    { id: 'q5', question: 'Do you have any suggestions for improving the workplace?' },
    { id: 'q6', question: 'What could the company have done to keep you?' },
  ];

  useEffect(() => {
    fetchApprovedResignations();
  }, []);

  const fetchApprovedResignations = async () => {
    try {
      const response = await resignationsAPI.getAll();
      const approved = response.data.filter(r => r.status === 'Approved');
      
      // Check which resignations already have exit interviews
      const withExitInterviewStatus = await Promise.all(
        approved.map(async (resignation) => {
          try {
            await exitInterviewsAPI.getByResignationId(resignation.id);
            return { ...resignation, hasExitInterview: true };
          } catch (err) {
            return { ...resignation, hasExitInterview: false };
          }
        })
      );
      
      setResignations(withExitInterviewStatus);
    } catch (err) {
      setError('Failed to load resignations');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await exitInterviewsAPI.create({
        resignationId: selectedResignation.id,
        answers
      });
      setSuccess('Exit interview submitted successfully!');
      setAnswers({});
      setSelectedResignation(null);
      fetchApprovedResignations();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit exit interview');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const eligibleResignations = resignations.filter(r => !r.hasExitInterview);

  if (eligibleResignations.length === 0) {
    return (
      <div>
        <h2>Exit Interview</h2>
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="empty-state">
            {resignations.length === 0 ? (
              <p>You don't have any approved resignations yet.</p>
            ) : (
              <p>You have already completed exit interviews for all your approved resignations.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Exit Interview</h2>

      {!selectedResignation ? (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Select a Resignation</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Choose which resignation you'd like to complete an exit interview for.
          </p>
          
          {eligibleResignations.map((resignation) => (
            <div
              key={resignation.id}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setSelectedResignation(resignation)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: '500' }}>
                    Resignation submitted on {new Date(resignation.submittedAt).toLocaleDateString()}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                    Exit Date: {new Date(resignation.exitDate).toLocaleDateString()}
                  </p>
                </div>
                <button className="btn btn-primary btn-sm">
                  Complete Interview
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ marginTop: '20px' }}>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: '500' }}>
              Resignation Details
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
              Exit Date: {new Date(selectedResignation.exitDate).toLocaleDateString()}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {questions.map((q, index) => (
              <div key={q.id} className="form-group">
                <label htmlFor={q.id}>
                  {index + 1}. {q.question} *
                </label>
                <textarea
                  id={q.id}
                  className="form-control"
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  required
                  rows="3"
                  placeholder="Your answer..."
                />
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Exit Interview'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedResignation(null);
                  setAnswers({});
                  setError('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExitInterview;
