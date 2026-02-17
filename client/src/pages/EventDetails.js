import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      setError('Failed to fetch event details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setRegistering(true);
      setError('');
      setSuccess('');
      await axios.post('http://localhost:5000/api/registrations', {
        eventId: id,
      });
      setSuccess('Successfully registered for the event!');
      fetchEvent(); // Refresh event data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register for event');
      console.error(err);
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container">
        <div className="alert alert-info">Event not found</div>
      </div>
    );
  }

  const availableSpots = event.capacity - event.registeredCount;
  const isRegistered = event.isRegistered;

  return (
    <div className="container">
      <div className="event-details">
        <div className="event-details-header">
          <h1 className="event-details-title">{event.title}</h1>
          <div className="event-details-info">
            <div className="event-details-item">
              <span className="event-details-label">Date</span>
              <span className="event-details-value">{formatDate(event.date)}</span>
            </div>
            <div className="event-details-item">
              <span className="event-details-label">Time</span>
              <span className="event-details-value">{event.time}</span>
            </div>
            <div className="event-details-item">
              <span className="event-details-label">Location</span>
              <span className="event-details-value">{event.location}</span>
            </div>
            <div className="event-details-item">
              <span className="event-details-label">Venue</span>
              <span className="event-details-value">{event.venue}</span>
            </div>
            <div className="event-details-item">
              <span className="event-details-label">Category</span>
              <span className="event-details-value">{event.category}</span>
            </div>
            <div className="event-details-item">
              <span className="event-details-label">Price</span>
              <span className="event-details-value">
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </span>
            </div>
          </div>
        </div>

        <div className="event-description">
          <h2>About This Event</h2>
          <p>{event.description}</p>
        </div>

        <div className="event-actions">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: event.price === 0 ? '#28a745' : '#333' }}>
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </span>
            </div>
            <div>
              <span style={{ color: availableSpots > 0 ? '#666' : '#dc3545' }}>
                {availableSpots > 0 ? `${availableSpots} spots left` : 'Sold Out'}
              </span>
            </div>
          </div>

          {isRegistered ? (
            <button className="btn btn-success" disabled style={{ width: '100%' }}>
              Already Registered
            </button>
          ) : availableSpots > 0 ? (
            <button 
              className="btn btn-primary" 
              onClick={handleRegister}
              disabled={registering}
              style={{ width: '100%' }}
            >
              {registering ? 'Registering...' : 'Register Now'}
            </button>
          ) : (
            <button className="btn btn-secondary" disabled style={{ width: '100%' }}>
              Event Full
            </button>
          )}

          {!isAuthenticated && availableSpots > 0 && (
            <p style={{ marginTop: '10px', textAlign: 'center', color: '#666' }}>
              Please login to register for this event
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
