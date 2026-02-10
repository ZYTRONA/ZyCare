/**
 * Email OTP Utility - Client Side
 * Handles OTP generation, storage, and verification
 * Sends actual emails via backend API
 */

import axios from 'axios';

// Backend API URL - Use the correct machine IP
const API_URL = 'http://192.168.137.193:5000/api/auth';

// In-memory OTP storage (in production, use secure storage)
const otpStore = new Map();
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/**
 * @typedef {Object} OTPSendResponse
 * @property {boolean} success
 * @property {string} message
 * @property {string} [otp]
 */

/**
 * @typedef {Object} UserData
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} role
 */

/**
 * @typedef {Object} OTPVerifyResponse
 * @property {boolean} success
 * @property {boolean} verified
 * @property {string} message
 * @property {UserData} [user]
 */

/**
 * Generate a random 6-digit OTP
 * @returns {string} - 6-digit OTP
 */
export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

/**
 * Send OTP email via backend API
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} otp - OTP to send
 * @returns {Promise<OTPSendResponse>} - Success status
 */
export const sendOTPEmail = async (email, name, otp) => {
  try {
    // Store OTP with expiration and user name
    otpStore.set(email, {
      otp,
      name, // Store the user's name
      expiresAt: Date.now() + OTP_EXPIRY_TIME,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
    });

    console.log(`📧 Calling backend to send OTP to ${email}...`);
    console.log(`🔗 API URL: ${API_URL}/send-otp`);

    // Send OTP via backend API (nodemailer)
    const response = await axios.post(`${API_URL}/send-otp`, {
      email,
      name,
      otp
    }, {
      timeout: 15000 // 15 second timeout
    });

    console.log('✅ OTP Email sent successfully to:', email);
    console.log('📝 Backend response:', response.data);

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message);
    console.error('📋 Error details:', {
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Clean up stored OTP if email send failed
    otpStore.delete(email);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.',
    };
  }
};

/**
 * Verify OTP code
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @returns {Promise<OTPVerifyResponse>} - Verification result
 */
export const verifyOTP = async (email, otp) => {
  try {
    const storedData = otpStore.get(email);

    if (!storedData) {
      return {
        success: false,
        verified: false,
        message: 'OTP expired or not found. Please request a new OTP.',
      };
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return {
        success: false,
        verified: false,
        message: 'OTP has expired. Please request a new one.',
      };
    }

    // Check max attempts
    if (storedData.attempts >= storedData.maxAttempts) {
      otpStore.delete(email);
      return {
        success: false,
        verified: false,
        message: 'Too many failed attempts. Please request a new OTP.',
      };
    }

    // Verify OTP
    if (otp !== storedData.otp) {
      storedData.attempts += 1;
      const remaining = storedData.maxAttempts - storedData.attempts;
      return {
        success: false,
        verified: false,
        message: `Invalid OTP. ${remaining} attempts remaining.`,
      };
    }

    // OTP is valid - clear it
    otpStore.delete(email);

    console.log(`✅ OTP verified successfully for ${email}`);

    return {
      success: true,
      verified: true,
      message: 'OTP verified successfully',
      user: {
        id: 'user_' + Date.now(),
        email,
        name: storedData.name || 'User', // Use stored name
        role: 'patient',
      },
    };
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    return {
      success: false,
      verified: false,
      message: 'Verification failed',
    };
  }
};

/**
 * Resend OTP to email
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>} - Result
 */
export const resendOTP = async (email, name) => {
  try {
    // Clear old OTP
    otpStore.delete(email);

    // Generate new OTP
    const newOtp = generateOTP();

    // Send new OTP
    return await sendOTPEmail(email, name, newOtp);
  } catch (error) {
    console.error('❌ Failed to resend OTP:', error);
    return {
      success: false,
      message: 'Failed to resend OTP',
    };
  }
};

/**
 * Clear all stored OTPs
 */
export const clearAllOTPs = () => {
  otpStore.clear();
  console.log('🗑️ All OTPs cleared');
};

export default {
  generateOTP,
  sendOTPEmail,
  verifyOTP,
  resendOTP,
  clearAllOTPs,
};
