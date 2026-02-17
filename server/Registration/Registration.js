const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'waitlisted'],
    default: 'confirmed'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  cancellationReason: {
    type: String,
    default: ''
  }
});


registrationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
