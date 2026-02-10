const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../utils/mail');

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

// Cleanup expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
}, 60000); // Check every minute

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, name, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        email,
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

    // Generate a 6-digit OTP
    const otp = generateOTP(6);
    
    // Store OTP with expiration time
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_TIME,
      attempts: 0,
      maxAttempts: 5
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, user.name, otp);

    if (!emailSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP. Please try again.' 
      });
    }

    console.log(`🔐 OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent to your email',
      userId: user._id,
      role: user.role,
      name: user.name
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    // Check if OTP exists and is not expired
    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired or not found. Please request a new OTP.' 
      });
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    // Check max attempts
    if (storedData.attempts >= storedData.maxAttempts) {
      otpStore.delete(email);
      return res.status(429).json({ 
        success: false, 
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (otp !== storedData.otp) {
      storedData.attempts += 1;
      const remaining = storedData.maxAttempts - storedData.attempts;
      return res.status(400).json({ 
        success: false, 
        message: `Invalid OTP. ${remaining} attempts remaining.` 
      });
    }

    // OTP is valid - clear it
    otpStore.delete(email);

    // Get user details
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Send welcome email for new users
    if (user.isNewUser) {
      await sendWelcomeEmail(email, user.name);
      user.isNewUser = false;
      await user.save();
    }

    res.json({ 
      success: true, 
      verified: true,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/resend-otp - Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate new OTP
    const otp = generateOTP(6);
    
    // Store OTP with expiration time
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_TIME,
      attempts: 0,
      maxAttempts: 5
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, user.name, otp);

    if (!emailSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to resend OTP. Please try again.' 
      });
    }

    console.log(`🔐 Resent OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP resent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/send-otp - Send OTP email (for frontend-managed OTP)
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name, otp } = req.body;

    console.log('📨 Incoming send-otp request:', { email, name, otp });

    if (!email || !otp) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    console.log(`🔐 Attempting to send OTP to ${email}...`);

    // Send OTP via email using nodemailer
    const emailSent = await sendOTPEmail(email, name || 'User', otp);

    if (!emailSent) {
      console.error(`❌ Email sending failed for ${email}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP email. Please check email configuration.' 
      });
    }

    console.log(`✅ OTP email sent to ${email} via nodemailer`);

    res.json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('❌ Send OTP error:', error.message, error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

module.exports = router;
