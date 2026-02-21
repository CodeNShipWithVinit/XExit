import React, { useState, useEffect } from 'react';
import { resignationsAPI } from '../services/api';

const AllResignations = () => {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [exitDate, setExitDate] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

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

  const handleApprove = async () => {
    if (!exitDate) {
      alert('Please select an exit date');
      return;
    }

    setActionLoading(true);
    try {
      await resignationsAPI.approve(selectedResignation.id, exitDate);
      alert('Resignation approved successfully!');
      setShowModal(false);
      setSelectedResignation(null);
      setExitDate('');
      fetchResignations();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve resignation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await resignationsAPI.reject(selectedResignation.id, rejectionReason);
      alert('Resignation rejected');
      setShowModal(false);
      setSelectedResignation(null);
      setRejectionReason('');
      fetchResignations();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject resignation');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (resignation) => {
    setSelectedResignation(resignation);
    setExitDate(resignation.lastWorkingDay);
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Loading resignations...</div>;
  }

  const filteredResignations = filterStatus === 'All' 
    ? resignations 
    : resignations.filter(r => r.status === filterStatus);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>All Resignation Requests</h2>
        <div>
          <select
            className="form-control"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: 'auto', display: 'inline-block' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginTop: '20px' }}>
          {error}
        </div>
      )}

      {filteredResignations.length === 0 ? (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="empty-state">
            <p>No resignation requests found.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '20px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Submitted Date</th>
                <th>Last Working Day</th>
                <th>Status</th>
                <th>Exit Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResignations.map((resignation) => (
                <tr key={resignation.id}>
                  <td>{resignation.employeeName}</td>
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
                    {resignation.status === 'Pending' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openModal(resignation)}
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          alert(`Reason: ${resignation.reason}\n\n${
                            resignation.rejectionReason 
                              ? `Rejection Reason: ${resignation.rejectionReason}`
                              : ''
                          }`);
                        }}
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedResignation && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Review Resignation Request</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowModal(false);
                  setSelectedResignation(null);
                  setExitDate('');
                  setRejectionReason('');
                }}
              >
                ×
              </button>
            </div>

            <div>
              <p><strong>Employee:</strong> {selectedResignation.employeeName}</p>
              <p><strong>Email:</strong> {selectedResignation.employeeEmail}</p>
              <p><strong>Submitted:</strong> {new Date(selectedResignation.submittedAt).toLocaleDateString()}</p>
              <p><strong>Intended Last Working Day:</strong> {new Date(selectedResignation.lastWorkingDay).toLocaleDateString()}</p>
              <p><strong>Reason:</strong></p>
              <p style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                {selectedResignation.reason}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="exitDate">Exit Date *</label>
              <input
                type="date"
                id="exitDate"
                className="form-control"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="rejectionReason">Rejection Reason (optional)</label>
              <textarea
                id="rejectionReason"
                className="form-control"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason if rejecting..."
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-success"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                Approve
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={actionLoading}
              >
                Reject
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setSelectedResignation(null);
                  setExitDate('');
                  setRejectionReason('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllResignations;
