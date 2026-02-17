import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const availableSpots = event.capacity - event.registeredCount;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="event-card">
      <div className="event-image">
        {event.image ? (
          <img src={event.image} alt={event.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '200px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#6c757d' }}>No Image</span>
          </div>
        )}
      </div>
      <div className="event-content">
        <h3 className="event-title">{event.title}</h3>
        <div className="event-info">
          <div className="event-info-item">
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="event-info-item">
            <span>{event.time}</span>
          </div>
          <div className="event-info-item">
            <span> {event.location}</span>
          </div>
          <div className="event-info-item">
            <span> {event.category}</span>
          </div>
        </div>
        <div className="event-footer">
          <span className="event-price">
            {event.price === 0 ? 'Free' : `$${event.price}`}
          </span>
          <span className="event-spots">
            {availableSpots > 0 ? `${availableSpots} spots left` : 'Sold Out'}
          </span>
        </div>
        <Link to={`/events/${event._id}`} className="btn btn-primary" style={{ marginTop: '15px', width: '100%', display: 'block', textAlign: 'center' }}>
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
