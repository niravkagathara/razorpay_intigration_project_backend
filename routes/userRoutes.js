const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const sendEmail = require('../utils/emailService');

// Check team status by leader email
router.post('/check-status', async (req, res) => {
  try {
    const { leaderEmail } = req.body;

    const team = await Team.findOne({ leaderEmail });
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found with this email'
      });
    }

    // OTP जनरेट करें
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP temporarily (in production, use Redis or database)
    global.otpStore = global.otpStore || {};
    global.otpStore[leaderEmail] = {
      otp: otp,
      timestamp: Date.now()
    };

    // OTP ईमेल से भेजें
    await sendEmail({
      to: leaderEmail,
      subject: '🔐 Your OTP for Team Status',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a, #2d2d2d); color: white; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #fbbf24; margin: 0;">🔐 OTP Verification</h1>
            <h2 style="color: #3b82f6; margin: 10px 0;">Check Your Team Status</h2>
          </div>
          <div style="background: rgba(59, 130, 246, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h3 style="color: #fbbf24; margin-top: 0;">Your One Time Password (OTP)</h3>
            <div style="font-size: 2.5rem; letter-spacing: 8px; font-weight: bold; color: #10b981; background: rgba(16,185,129,0.1); padding: 16px 0; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #d1d5db;">Enter this OTP in the website to verify your identity and check your team status.</p>
          </div>
          <div style="background: rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 8px;">
            <h4 style="color: #ef4444; margin-top: 0;">⚠️ Important:</h4>
            <ul style="color: #d1d5db;">
              <li>This OTP is valid for 5 minutes only.</li>
              <li>Do not share this OTP with anyone.</li>
            </ul>
          </div>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="color: #9ca3af; margin: 0;">🎮 Free Fire Pro Championship 2025</p>
            <p style="color: #6b7280; margin: 5px 0;">Powered by Tournament Management System</p>
          </div>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'OTP sent to your email',
      team: {
        teamName: team.teamName,
        leaderName: team.leaderName,
        teamSize: team.teamSize,
        members: team.members,
        verificationStatus: team.verificationStatus,
        registrationToken: team.registrationToken,
        createdAt: team.createdAt,
        tournamentUpdates: team.tournamentUpdates
      }
    });

  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check team status'
    });
  }
});

// Verify OTP and show team details
router.post('/verify-otp', async (req, res) => {
  try {
    const { leaderEmail, otp } = req.body;

    // Check if OTP exists and is valid
    if (!global.otpStore || !global.otpStore[leaderEmail]) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please try again.'
      });
    }

    const storedOtp = global.otpStore[leaderEmail];
    
    // Check if OTP is expired (5 minutes)
    if (Date.now() - storedOtp.timestamp > 5 * 60 * 1000) {
      delete global.otpStore[leaderEmail];
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (storedOtp.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Get team details
    const team = await Team.findOne({ leaderEmail });
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Clear OTP after successful verification
    delete global.otpStore[leaderEmail];

    res.json({
      success: true,
      message: 'OTP verified successfully',
      team: {
        teamName: team.teamName,
        leaderName: team.leaderName,
        teamSize: team.teamSize,
        members: team.members,
        verificationStatus: team.verificationStatus,
        registrationToken: team.registrationToken,
        createdAt: team.createdAt,
        tournamentUpdates: team.tournamentUpdates
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed'
    });
  }
});

// Get team details by registration token
router.get('/team/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const team = await Team.findOne({ registrationToken: token });
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Invalid registration token'
      });
    }

    res.json({
      success: true,
      team: {
        teamName: team.teamName,
        leaderName: team.leaderName,
        teamSize: team.teamSize,
        members: team.members,
        verificationStatus: team.verificationStatus,
        createdAt: team.createdAt,
        tournamentUpdates: team.tournamentUpdates
      }
    });

  } catch (error) {
    console.error('Get team details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team details'
    });
  }
});

module.exports = router; 