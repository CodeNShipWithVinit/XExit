import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resignationsAPI } from '../services/api';

const SubmitResignation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastWorkingDay: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resignationsAPI.create(formData);
      setSuccess('Resignation request submitted successfully!');
      setFormData({ lastWorkingDay: '', reason: '' });
      
      setTimeout(() => {
        navigate('/dashboard/my-resignations');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit resignation');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div>
      <h2>Submit Resignation Request</h2>
      
      <div className="card" style={{ maxWidth: '600px', marginTop: '20px' }}>
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="lastWorkingDay">
              Intended Last Working Day *
            </label>
            <input
              type="date"
              id="lastWorkingDay"
              name="lastWorkingDay"
              className="form-control"
              value={formData.lastWorkingDay}
              onChange={handleChange}
              min={minDate}
              required
            />
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
              Must be a weekday and not a public holiday
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="reason">
              Reason for Resignation *
            </label>
            <textarea
              id="reason"
              name="reason"
              className="form-control"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Please provide your reason for resignation..."
              required
              rows="5"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Resignation'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ maxWidth: '600px', marginTop: '20px', backgroundColor: '#f8f9fa' }}>
        <h4>Important Information</h4>
        <ul style={{ marginLeft: '20px', color: '#666' }}>
          <li>Your resignation request will be reviewed by HR</li>
          <li>You will receive an email notification once your request is processed</li>
          <li>If approved, you'll be able to complete an exit interview</li>
          <li>The last working day cannot be a weekend or public holiday</li>
        </ul>
      </div>
    </div>
  );
};

export default SubmitResignation;
