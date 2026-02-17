import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      fetchRegistrations();
    }
  }, [user, authLoading, navigate]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/registrations/my');
      setRegistrations(res.data);
    } catch (err) {
      setError('Failed to fetch registrations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (registrationId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    try {
      setError('');
      await axios.delete(`http://localhost:5000/api/registrations/${registrationId}`);
      setRegistrations(registrations.filter(reg => reg._id !== registrationId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel registration');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user.name}</h1>
        <p>Your email: {user.email}</p>
        <p>Your role: {user.role}</p>
      </div>

      <h2 style={{ marginBottom: '20px' }}>My Registrations</h2>

      {error && <div className="error-message">{error}</div>}

      {registrations.length === 0 ? (
        <div className="alert alert-info">
          You haven't registered for any events yet. 
          <a href="/" style={{ marginLeft: '10px' }}>Browse Events</a>
        </div>
      ) : (
        <div className="registrations-list">
          {registrations.map((registration) => (
            <div key={registration._id} className="registration-card">
              <div className="registration-info">
                <h3>{registration.event?.title || 'Event'}</h3>
                <p> {registration.event ? formatDate(registration.event.date) : 'N/A'}</p>
                <p> {registration.event?.time || 'N/A'}</p>
                <p> {registration.event?.location || 'N/A'}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span className={`registration-status status-${registration.status}`}>
                  {registration.status}
                </span>
                {registration.status === 'confirmed' && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleCancel(registration._id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
