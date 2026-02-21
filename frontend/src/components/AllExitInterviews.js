import React, { useState, useEffect } from 'react';
import { exitInterviewsAPI } from '../services/api';

const AllExitInterviews = () => {
  const [exitInterviews, setExitInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchExitInterviews();
  }, []);

  const fetchExitInterviews = async () => {
    try {
      const response = await exitInterviewsAPI.getAll();
      setExitInterviews(response.data);
    } catch (err) {
      setError('Failed to load exit interviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReviewed = async (id) => {
    try {
      await exitInterviewsAPI.markAsReviewed(id);
      alert('Exit interview marked as reviewed');
      fetchExitInterviews();
    } catch (err) {
      alert('Failed to mark as reviewed');
    }
  };

  const openModal = (interview) => {
    setSelectedInterview(interview);
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Loading exit interviews...</div>;
  }

  return (
    <div>
      <h2>Exit Interviews</h2>

      {error && (
        <div className="alert alert-error" style={{ marginTop: '20px' }}>
          {error}
        </div>
      )}

      {exitInterviews.length === 0 ? (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="empty-state">
            <p>No exit interviews have been submitted yet.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '20px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exitInterviews.map((interview) => (
                <tr key={interview.id}>
                  <td>{interview.employeeName}</td>
                  <td>{new Date(interview.submittedAt).toLocaleDateString()}</td>
                  <td>
                    {interview.reviewedAt ? (
                      <span className="badge badge-approved">Reviewed</span>
                    ) : (
                      <span className="badge badge-pending">Pending Review</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => openModal(interview)}
                      style={{ marginRight: '5px' }}
                    >
                      View
                    </button>
                    {!interview.reviewedAt && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleMarkAsReviewed(interview.id)}
                      >
                        Mark as Reviewed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedInterview && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Exit Interview Details</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowModal(false);
                  setSelectedInterview(null);
                }}
              >
                ×
              </button>
            </div>

            <div>
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 5px 0' }}><strong>Employee:</strong> {selectedInterview.employeeName}</p>
                <p style={{ margin: '0 0 5px 0' }}><strong>Submitted:</strong> {new Date(selectedInterview.submittedAt).toLocaleDateString()}</p>
                {selectedInterview.reviewedAt && (
                  <p style={{ margin: 0 }}><strong>Reviewed:</strong> {new Date(selectedInterview.reviewedAt).toLocaleDateString()}</p>
                )}
              </div>

              <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Interview Responses</h3>
              
              {Object.entries(selectedInterview.answers).map(([questionId, answer], index) => (
                <div key={questionId} style={{ marginBottom: '20px' }}>
                  <p style={{ fontWeight: '500', marginBottom: '8px' }}>
                    Question {index + 1}:
                  </p>
                  <p style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '12px', 
                    borderRadius: '4px',
                    borderLeft: '3px solid #007bff',
                    margin: 0
                  }}>
                    {answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              {!selectedInterview.reviewedAt && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    handleMarkAsReviewed(selectedInterview.id);
                    setShowModal(false);
                  }}
                >
                  Mark as Reviewed
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setSelectedInterview(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllExitInterviews;
