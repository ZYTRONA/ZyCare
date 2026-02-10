const nodemailer = require('nodemailer');

// Configure email service
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: (process.env.EMAIL_PASSWORD || 'your-app-password').replace(/\s/g, '') // Remove spaces from password
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email Configuration Error:', error.message);
  } else {
    console.log('✅ Email Service Ready');
  }
});

/**
 * Generate a random OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Random OTP
 */
function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/**
 * Send OTP via email
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} otp - OTP to send
 * @returns {Promise<boolean>} - Success status
 */
async function sendOTPEmail(email, name, otp) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@zycare.com',
      to: email,
      subject: 'ZYCARE - Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #007bff; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">ZYCARE</h1>
          </div>
          <div style="padding: 30px; background-color: #f8f9fa;">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your OTP for login is:</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #007bff;">
              <h2 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h2>
            </div>
            <p style="color: #666;">This OTP will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this OTP, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">© 2026 ZYCARE. All rights reserved.</p>
          </div>
        </div>
      `
    };

    console.log(`📧 Sending OTP email to ${email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    console.log(`📨 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`);
    console.error(`   Error Code: ${error.code}`);
    console.error(`   Error Message: ${error.message}`);
    console.error(`   Full Error:`, error);
    return false;
  }
}

/**
 * Send welcome email
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @returns {Promise<boolean>} - Success status
 */
async function sendWelcomeEmail(email, name) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@zycare.com',
      to: email,
      subject: 'Welcome to ZYCARE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #007bff; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">Welcome to ZYCARE</h1>
          </div>
          <div style="padding: 30px; background-color: #f8f9fa;">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for joining ZYCARE! We're excited to help you with your healthcare needs.</p>
            <p>You can now access our services including:</p>
            <ul>
              <li>AI-powered symptom checker</li>
              <li>Connect with doctors</li>
              <li>Book appointments</li>
              <li>Access your medical records</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">© 2026 ZYCARE. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Welcome email sent to ${email}: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error.message);
    return false;
  }
}

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail
};
