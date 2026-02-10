const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: {
    type: String,
    required: true
  },
  ai_analysis: {
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: true
    },
    score: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    recommended_action: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['queued', 'consulting', 'completed'],
    default: 'queued'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  doctorNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);
