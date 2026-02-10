const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// Sample doctors data for seeding
const sampleDoctors = [
  {
    name: 'Dr. Raj Kumar',
    email: 'raj.kumar@hospital.com',
    phone: '+91-9876543210',
    specialty: 'General Physician',
    qualifications: ['MBBS', 'MD (Internal Medicine)'],
    experience: 10,
    rating: 4.8,
    consultationFee: 300,
    bio: 'Experienced general physician with 10 years of practice in patient care and diagnosis.',
    isAvailable: true,
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@hospital.com',
    phone: '+91-9876543211',
    specialty: 'Cardiologist',
    qualifications: ['MBBS', 'DM (Cardiology)'],
    experience: 12,
    rating: 4.9,
    consultationFee: 500,
    bio: 'Specialist in cardiac care and heart disease management.',
    isAvailable: true,
  },
  {
    name: 'Dr. Arun Patel',
    email: 'arun.patel@hospital.com',
    phone: '+91-9876543212',
    specialty: 'Pediatrician',
    qualifications: ['MBBS', 'MD (Pediatrics)'],
    experience: 8,
    rating: 4.7,
    consultationFee: 250,
    bio: 'Child health specialist dedicated to pediatric care and development.',
    isAvailable: true,
  },
  {
    name: 'Dr. Meera Singh',
    email: 'meera.singh@hospital.com',
    phone: '+91-9876543213',
    specialty: 'Dermatologist',
    qualifications: ['MBBS', 'MD (Dermatology)'],
    experience: 9,
    rating: 4.6,
    consultationFee: 400,
    bio: 'Skin specialist with expertise in dermatological treatments.',
    isAvailable: true,
  },
  {
    name: 'Dr. Vikram Gupta',
    email: 'vikram.gupta@hospital.com',
    phone: '+91-9876543214',
    specialty: 'Orthopedic',
    qualifications: ['MBBS', 'MS (Orthopedy)'],
    experience: 11,
    rating: 4.5,
    consultationFee: 450,
    bio: 'Joint and bone specialist with advanced surgical expertise.',
    isAvailable: true,
  },
  {
    name: 'Dr. Ananya Reddy',
    email: 'ananya.reddy@hospital.com',
    phone: '+91-9876543215',
    specialty: 'Neurologist',
    qualifications: ['MBBS', 'DM (Neurology)'],
    experience: 10,
    rating: 4.8,
    consultationFee: 500,
    bio: 'Neurological disorder specialist with expertise in brain health.',
    isAvailable: true,
  },
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@hospital.com',
    phone: '+91-9876543216',
    specialty: 'Psychiatrist',
    qualifications: ['MBBS', 'DPM'],
    experience: 7,
    rating: 4.4,
    consultationFee: 350,
    bio: 'Mental health specialist providing comprehensive psychological care.',
    isAvailable: true,
  },
  {
    name: 'Dr. Neha Verma',
    email: 'neha.verma@hospital.com',
    phone: '+91-9876543217',
    specialty: 'Ophthalmologist',
    qualifications: ['MBBS', 'MS (Ophthalmology)'],
    experience: 8,
    rating: 4.7,
    consultationFee: 300,
    bio: 'Eye care specialist with expertise in vision correction.',
    isAvailable: true,
  },
  {
    name: 'Dr. Sameer Joshi',
    email: 'sameer.joshi@hospital.com',
    phone: '+91-9876543218',
    specialty: 'ENT',
    qualifications: ['MBBS', 'MS (ENT)'],
    experience: 9,
    rating: 4.6,
    consultationFee: 350,
    bio: 'ENT specialist for ear, nose, and throat disorders.',
    isAvailable: true,
  },
  {
    name: 'Dr. Shalini Nair',
    email: 'shalini.nair@hospital.com',
    phone: '+91-9876543219',
    specialty: 'Gastroenterologist',
    qualifications: ['MBBS', 'DM (Gastroenterology)'],
    experience: 11,
    rating: 4.8,
    consultationFee: 450,
    bio: 'Digestive system specialist with endoscopy expertise.',
    isAvailable: true,
  },
];

// GET /api/doctors - Get all doctors
router.get('/', async (req, res) => {
  try {
    console.log('📡 GET /api/doctors - Fetching all doctors');
    
    let doctors = await Doctor.find().lean();
    
    // If no doctors exist, seed sample data
    if (doctors.length === 0) {
      console.log('📝 Seeding sample doctors...');
      await Doctor.insertMany(sampleDoctors);
      doctors = await Doctor.find().lean();
      console.log('✅ Sample doctors created:', doctors.length);
    }
    
    // Normalize _id to id for frontend compatibility
    const normalizedDoctors = doctors.map(doc => ({
      ...doc,
      id: doc._id.toString(),
    }));
    
    res.json(normalizedDoctors);
  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET /api/doctors/specialty/:specialty - Get doctors by specialty
router.get('/specialty/:specialty', async (req, res) => {
  try {
    const { specialty } = req.params;
    console.log('📡 GET /api/doctors/specialty/:specialty - Specialty:', specialty);
    
    const doctors = await Doctor.find({ 
      specialty: { $regex: specialty, $options: 'i' } 
    }).lean();
    
    // Normalize _id to id for frontend compatibility
    const normalizedDoctors = doctors.map(doc => ({
      ...doc,
      id: doc._id.toString(),
    }));
    
    console.log(`✅ Found ${normalizedDoctors.length} doctors with specialty: ${specialty}`);
    res.json(normalizedDoctors);
  } catch (error) {
    console.error('❌ Error fetching doctors by specialty:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET /api/doctors/:doctorId - Get doctor by ID
router.get('/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('📡 GET /api/doctors/:doctorId - Doctor ID:', doctorId);
    
    const doctor = await Doctor.findById(doctorId).lean();
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Normalize _id to id for frontend compatibility
    const normalizedDoctor = {
      ...doctor,
      id: doctor._id.toString(),
    };
    
    console.log('✅ Doctor found:', doctor.name);
    res.json(normalizedDoctor);
  } catch (error) {
    console.error('❌ Error fetching doctor:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;
