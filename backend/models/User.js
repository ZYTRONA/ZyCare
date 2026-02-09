const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'agent'],
    default: 'patient'
  },
  name: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'en'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
