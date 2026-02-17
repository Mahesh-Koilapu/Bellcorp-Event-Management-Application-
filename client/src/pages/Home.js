import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/events');
      setEvents(res.data.events || []);
    } catch (err) {
      setError('Failed to fetch events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (category) params.append('category', category);
      
      const res = await axios.get(`http://localhost:5000/api/events?${params.toString()}`);
      setEvents(res.data.events || []);
    } catch (err) {
      setError('Failed to search events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (cat) => {
    setCategory(cat);
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (cat) params.append('category', cat);
      
      const res = await axios.get(`http://localhost:5000/api/events?${params.toString()}`);
      setEvents(res.data.events || []);
    } catch (err) {
      setError('Failed to filter events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="hero">
        <h1>Welcome to Bellcorp Events</h1>
        <p>Discover and register for amazing events</p>
      </div>

      <div className="container">
        <div className="search-filter">
          <form className="search-filter-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="meetup">Meetup</option>
              <option value="concert">Concert</option>
              <option value="exhibition">Exhibition</option>
              <option value="other">Other</option>
            </select>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setCategory('');
                fetchEvents();
              }}
            >
              Clear
            </button>
          </form>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="alert alert-info">No events found</div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
