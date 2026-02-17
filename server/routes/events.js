const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { search, category, date, page = 1, limit = 10 } = req.query;
    
    let query = { isPublished: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (date) {
      query.date = { $gte: new Date(date) };
    }
    
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is registered (if authenticated)
    let isRegistered = false;
    const token = req.header('x-auth-token') || (req.header('Authorization') && req.header('Authorization').substring(7));
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const registration = await Registration.findOne({
          user: decoded.id,
          event: req.params.id,
          status: { $in: ['confirmed', 'waitlisted'] }
        });
        isRegistered = !!registration;
      } catch (err) {
        // Token invalid or expired, user not registered
        isRegistered = false;
      }
    }
    
    res.json({ ...event.toObject(), isRegistered });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create events' });
    }
    
    const event = new Event({
      ...req.body,
      organizer: req.user.id
    });
    
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    await Registration.deleteMany({ event: req.params.id });
    
    await event.deleteOne();
    
    res.json({ message: 'Event removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const seedEvents = [
      {
        title: 'Tech Conference 2024',
        description: 'Annual technology conference featuring latest innovations',
        date: new Date('2024-06-15'),
        time: '09:00 AM',
        location: 'San Francisco',
        venue: 'Convention Center',
        category: 'conference',
        capacity: 500,
        price: 99,
        organizer: '65f1a2b3c4d5e6f7a8b9c0d1' 
      },
      {
        title: 'Web Development Workshop',
        description: 'Hands-on workshop for modern web development',
        date: new Date('2024-06-20'),
        time: '10:00 AM',
        location: 'Online',
        venue: 'Virtual',
        category: 'workshop',
        capacity: 100,
        price: 49
      },
      {
        title: 'Startup Meetup',
        description: 'Network with fellow entrepreneurs and investors',
        date: new Date('2024-07-01'),
        time: '06:00 PM',
        location: 'New York',
        venue: 'Innovation Hub',
        category: 'meetup',
        capacity: 200,
        price: 0
      }
    ];
    
    await Event.insertMany(seedEvents);
    res.json({ message: 'Events seeded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
