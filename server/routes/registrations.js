const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { eventId } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const existingRegistration = await Registration.findOne({
      user: req.user.id,
      event: eventId
    });
    
    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    if (event.registeredCount >= event.capacity) {
      const registration = new Registration({
        user: req.user.id,
        event: eventId,
        status: 'waitlisted'
      });
      await registration.save();
      return res.status(201).json({ message: 'Added to waitlist', registration });
    }
    
    const registration = new Registration({
      user: req.user.id,
      event: eventId,
      status: 'confirmed'
    });
    
    await registration.save();
    
    event.registeredCount += 1;
    await event.save();
    
    res.status(201).json(registration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate({
        path: 'event',
        populate: {
          path: 'organizer',
          select: 'name email'
        }
      })
      .sort({ registeredAt: -1 });
    
    res.json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    if (registration.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    registration.status = 'cancelled';
    registration.cancellationReason = req.body.reason || 'User cancelled';
    await registration.save();
    
    const event = await Event.findById(registration.event);
    if (event && event.registeredCount > 0) {
      event.registeredCount -= 1;
      await event.save();
      
      const waitlisted = await Registration.findOne({
        event: event._id,
        status: 'waitlisted'
      }).sort({ registeredAt: 1 });
      
      if (waitlisted) {
        waitlisted.status = 'confirmed';
        await waitlisted.save();
        event.registeredCount += 1;
        await event.save();
      }
    }
    
    res.json({ message: 'Registration cancelled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('user', 'name email')
      .sort({ registeredAt: -1 });
    
    res.json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
