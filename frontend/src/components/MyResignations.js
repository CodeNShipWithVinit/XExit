import React, { useState, useEffect } from 'react';
import { resignationsAPI } from '../services/api';

const MyResignations = () => {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResignations();
  }, []);

  const fetchResignations = async () => {
    try {
      const response = await resignationsAPI.getAll();
      setResignations(response.data);
    } catch (err) {
      setError('Failed to load resignations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your resignations...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2>My Resignation Requests</h2>

      {resignations.length === 0 ? (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="empty-state">
            <p>You haven't submitted any resignation requests yet.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '20px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Submitted Date</th>
                <th>Last Working Day</th>
                <th>Status</th>
                <th>Exit Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {resignations.map((resignation) => (
                <tr key={resignation.id}>
                  <td>{new Date(resignation.submittedAt).toLocaleDateString()}</td>
                  <td>{new Date(resignation.lastWorkingDay).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${resignation.status.toLowerCase()}`}>
                      {resignation.status}
                    </span>
                  </td>
                  <td>
                    {resignation.exitDate 
                      ? new Date(resignation.exitDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        // Show details modal
                        alert(`Reason: ${resignation.reason}\n\n${
                          resignation.rejectionReason 
                            ? `Rejection Reason: ${resignation.rejectionReason}`
                            : ''
                        }`);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card" style={{ marginTop: '20px', backgroundColor: '#f8f9fa' }}>
        <h4>Status Information</h4>
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          <div>
            <span className="badge badge-pending">Pending</span>
            <span style={{ marginLeft: '8px', color: '#666' }}>Awaiting HR review</span>
          </div>
          <div>
            <span className="badge badge-approved">Approved</span>
            <span style={{ marginLeft: '8px', color: '#666' }}>You can complete exit interview</span>
          </div>
          <div>
            <span className="badge badge-rejected">Rejected</span>
            <span style={{ marginLeft: '8px', color: '#666' }}>Request was declined</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyResignations;
