const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['conference', 'workshop', 'seminar', 'meetup', 'concert', 'exhibition', 'other'],
    default: 'other'
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  registeredCount: {
    type: Number,
    default: 0
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
eventSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Event', eventSchema);
