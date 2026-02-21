import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resignationsAPI, exitInterviewsAPI } from '../services/api';

const EmployeeHome = () => {
  const { user } = useAuth();
  const [resignations, setResignations] = useState([]);
  const [exitInterviews, setExitInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resignationsRes, exitInterviewsRes] = await Promise.all([
        resignationsAPI.getAll(),
        exitInterviewsAPI.getAll()
      ]);
      setResignations(resignationsRes.data);
      setExitInterviews(exitInterviewsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const pendingResignations = resignations.filter(r => r.status === 'Pending');
  const approvedResignations = resignations.filter(r => r.status === 'Approved');
  const completedExitInterviews = exitInterviews.length;

  return (
    <div>
      <h2>Welcome, {user?.name}!</h2>
      <p>Manage your resignation requests and exit interviews.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '36px', color: '#ffc107', margin: '10px 0' }}>
            {pendingResignations.length}
          </h3>
          <p style={{ color: '#666' }}>Pending Resignations</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '36px', color: '#28a745', margin: '10px 0' }}>
            {approvedResignations.length}
          </h3>
          <p style={{ color: '#666' }}>Approved Resignations</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '36px', color: '#007bff', margin: '10px 0' }}>
            {completedExitInterviews}
          </h3>
          <p style={{ color: '#666' }}>Exit Interviews Completed</p>
        </div>
      </div>

      {resignations.length === 0 ? (
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="empty-state">
            <p>You haven't submitted any resignation requests yet.</p>
            <p>Click on "Submit Resignation" to get started.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '30px' }}>
          <h3>Recent Activity</h3>
          {resignations.slice(0, 3).map(resignation => (
            <div key={resignation.id} style={{ padding: '15px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: '500' }}>
                    Resignation Request
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                    Submitted: {new Date(resignation.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge badge-${resignation.status.toLowerCase()}`}>
                  {resignation.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeHome;
