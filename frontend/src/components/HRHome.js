import React, { useState, useEffect } from 'react';
import { resignationsAPI, exitInterviewsAPI } from '../services/api';

const HRHome = () => {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    exitInterviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [resignationsRes, exitInterviewsRes] = await Promise.all([
        resignationsAPI.getAll(),
        exitInterviewsAPI.getAll()
      ]);

      const resignations = resignationsRes.data;
      setStats({
        pending: resignations.filter(r => r.status === 'Pending').length,
        approved: resignations.filter(r => r.status === 'Approved').length,
        rejected: resignations.filter(r => r.status === 'Rejected').length,
        exitInterviews: exitInterviewsRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <h2>HR Dashboard</h2>
      <p>Manage employee resignations and exit interviews.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '48px', color: '#ffc107', margin: '10px 0' }}>
            {stats.pending}
          </h3>
          <p style={{ color: '#666', fontWeight: '500' }}>Pending Resignations</p>
          <p style={{ fontSize: '13px', color: '#999' }}>Requires your review</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '48px', color: '#28a745', margin: '10px 0' }}>
            {stats.approved}
          </h3>
          <p style={{ color: '#666', fontWeight: '500' }}>Approved Resignations</p>
          <p style={{ fontSize: '13px', color: '#999' }}>Successfully processed</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '48px', color: '#dc3545', margin: '10px 0' }}>
            {stats.rejected}
          </h3>
          <p style={{ color: '#666', fontWeight: '500' }}>Rejected Resignations</p>
          <p style={{ fontSize: '13px', color: '#999' }}>Declined requests</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '48px', color: '#007bff', margin: '10px 0' }}>
            {stats.exitInterviews}
          </h3>
          <p style={{ color: '#666', fontWeight: '500' }}>Exit Interviews</p>
          <p style={{ fontSize: '13px', color: '#999' }}>Submitted by employees</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <a href="/dashboard/resignations" className="btn btn-primary">
            Review Resignations
          </a>
          <a href="/dashboard/exit-interviews" className="btn btn-secondary">
            View Exit Interviews
          </a>
        </div>
      </div>

      {stats.pending > 0 && (
        <div className="alert alert-info" style={{ marginTop: '20px' }}>
          <strong>Action Required:</strong> You have {stats.pending} pending resignation{stats.pending > 1 ? 's' : ''} waiting for review.
        </div>
      )}
    </div>
  );
};

export default HRHome;
