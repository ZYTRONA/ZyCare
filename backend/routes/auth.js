const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, name, role } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Check if user exists
    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user
      user = new User({
        phone,
        name: name || 'User',
        role: role || 'patient'
      });
      await user.save();
    } else {
      // Update existing user's name and role if provided
      if (name) user.name = name;
      if (role) user.role = role;
      await user.save();
    }

    // Generate a random 4-digit OTP for testing
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    console.log(`🔐 OTP for ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      otp: otp, // In production, don't send OTP in response, send via SMS
      userId: user._id,
      role: user.role,
      name: user.name
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/verify-otp (Mock implementation)
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    // In production, verify OTP with Firebase or SMS service
    // For now, accept any 4-digit OTP for testing
    if (otp && otp.length === 4) {
      // Get user details
      const user = await User.findOne({ phone });
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ 
        success: true, 
        verified: true,
        user: {
          userId: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP. Please enter 4 digits.' });
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
