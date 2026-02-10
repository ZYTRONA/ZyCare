const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    required: true,
    enum: [
      'General Physician',
      'Cardiologist',
      'Pediatrician',
      'Neurologist',
      'Dermatologist',
      'Orthopedic',
      'Psychiatrist',
      'Ophthalmologist',
      'ENT',
      'Gastroenterologist',
    ],
  },
  qualifications: {
    type: [String],
    default: [],
  },
  experience: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5,
  },
  consultationFee: {
    type: Number,
    default: 300,
  },
  bio: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: null,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  availableSlots: {
    type: [
      {
        date: String,
        startTime: String,
        endTime: String,
        isAvailable: Boolean,
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Doctor', doctorSchema);
