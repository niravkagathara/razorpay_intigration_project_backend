// controllers/registrationController.js
const Team = require('../models/Team');
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../utils/emailService');
const mongoose = require('mongoose'); // Added for connection status check

exports.registerTeam = async (req, res) => {
  try {
    const {
      leaderName,
      leaderEmail,
      mobile,
      teamName,
      teamSize,
      members
    } = req.body;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      // MongoDB is connected - use database
      const existingTeam = await Team.findOne({ teamName });
      if (existingTeam) {
        return res.status(400).json({
          success: false,
          message: 'Team name already exists'
        });
      }

      const existingLeader = await Team.findOne({ leaderEmail });
      if (existingLeader) {
        return res.status(400).json({
          success: false,
          message: 'Leader email already registered'
        });
      }

      const registrationToken = uuidv4();
      const team = new Team({
        leaderName,
        leaderEmail,
        mobile,
        teamName,
        teamSize,
        members,
        registrationToken,
        paymentStatus: 'completed', // Mark as completed since no payment required
        verificationStatus: 'pending'
      });

      await team.save();
      
      // Send confirmation emails to all team members
      await sendRegistrationEmails(team);
      
      res.status(201).json({
        success: true,
        message: 'Team registered successfully',
        teamId: team._id,
        registrationToken: team.registrationToken
      });
    } else {
      // MongoDB not connected - use in-memory storage
      console.log('Using in-memory storage');
      
      if (!global.inMemoryTeams) {
        global.inMemoryTeams = [];
      }

      // Check for existing team
      const existingTeam = global.inMemoryTeams.find(t => t.teamName === teamName);
      if (existingTeam) {
        return res.status(400).json({
          success: false,
          message: 'Team name already exists'
        });
      }

      const existingLeader = global.inMemoryTeams.find(t => t.leaderEmail === leaderEmail);
      if (existingLeader) {
        return res.status(400).json({
          success: false,
          message: 'Leader email already registered'
        });
      }

      const registrationToken = uuidv4();
      const teamData = {
        _id: uuidv4(),
        leaderName,
        leaderEmail,
        mobile,
        teamName,
        teamSize,
        members,
        registrationToken,
        paymentStatus: 'completed', // Mark as completed since no payment required
        verificationStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      global.inMemoryTeams.push(teamData);
      
      // Send confirmation emails to all team members
      await sendRegistrationEmails(teamData);
      
      res.status(201).json({
        success: true,
        message: 'Team registered successfully (in-memory)',
        teamId: teamData._id,
        registrationToken: teamData.registrationToken
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message
    });
  }
};

// Helper function to send registration emails
const sendRegistrationEmails = async (team) => {
  try {
    const allEmails = [team.leaderEmail, ...team.members.map(member => member.email)];
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a, #2d2d2d); color: white; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #fbbf24; margin: 0;">🔥 FREE FIRE TOURNAMENT 🔥</h1>
          <h2 style="color: #f59e0b; margin: 10px 0;">Registration Successful!</h2>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #10b981; margin-top: 0;">✅ Team Registration Confirmed</h3>
          
          <div style="margin: 15px 0;">
            <strong style="color: #fbbf24;">Team Name:</strong> ${team.teamName}<br>
            <strong style="color: #fbbf24;">Team Leader:</strong> ${team.leaderName}<br>
            <strong style="color: #fbbf24;">Team Size:</strong> ${team.teamSize} Players<br>
            <strong style="color: #fbbf24;">Registration Token:</strong> <span style="font-family: monospace; background: rgba(255, 255, 255, 0.1); padding: 2px 6px; border-radius: 4px;">${team.registrationToken}</span>
          </div>
          
          <div style="margin: 15px 0;">
            <strong style="color: #fbbf24;">Team Members:</strong><br>
            ${team.members.map((member, index) => 
              `${index + 1}. ${member.name} (${member.gameId}) - ${member.email}`
            ).join('<br>')}
          </div>
        </div>
        
        <div style="background: rgba(59, 130, 246, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="color: #3b82f6; margin-top: 0;">📋 Next Steps:</h4>
          <ul style="color: #d1d5db;">
            <li>Your team is now under verification process</li>
            <li>Admin will review your team details</li>
            <li>You'll receive verification confirmation via email</li>
            <li>Check your team status at: <a href="http://localhost:3000/status" style="color: #3b82f6;">Status Check Page</a></li>
          </ul>
        </div>
        
        <div style="background: rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 8px;">
          <h4 style="color: #ef4444; margin-top: 0;">⚠️ Important Notes:</h4>
          <ul style="color: #d1d5db;">
            <li>Keep your registration token safe</li>
            <li>All team members must be present during the tournament</li>
            <li>Follow tournament rules and guidelines</li>
            <li>Check your email regularly for updates</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
          <p style="color: #9ca3af; margin: 0;">🎮 Free Fire Pro Championship 2025</p>
          <p style="color: #6b7280; margin: 5px 0;">Powered by Tournament Management System</p>
        </div>
      </div>
    `;

    // Send email to all team members
    for (const email of allEmails) {
      await sendEmail({
        to: email,
        subject: '✅ Free Fire Tournament - Registration Successful!',
        html: emailContent
      });
    }

    console.log(`📧 Registration confirmation emails sent to ${allEmails.length} team members`);
  } catch (error) {
    console.error('❌ Failed to send registration emails:', error);
  }
};

exports.getTeamStatus = async (req, res) => {
  try {
    const { leaderEmail, otp } = req.body;

    if (mongoose.connection.readyState === 1) {
      // MongoDB is connected
      const team = await Team.findOne({ leaderEmail });
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      res.json({
        success: true,
        team: {
          teamName: team.teamName,
          leaderName: team.leaderName,
          teamSize: team.teamSize,
          members: team.members,
          paymentStatus: team.paymentStatus,
          verificationStatus: team.verificationStatus,
          registrationToken: team.registrationToken,
          createdAt: team.createdAt,
          tournamentUpdates: team.tournamentUpdates
        }
      });
    } else {
      // In-memory storage
      const team = global.inMemoryTeams.find(t => t.leaderEmail === leaderEmail);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      res.json({
        success: true,
        team: {
          teamName: team.teamName,
          leaderName: team.leaderName,
          teamSize: team.teamSize,
          members: team.members,
          paymentStatus: team.paymentStatus,
          verificationStatus: team.verificationStatus,
          registrationToken: team.registrationToken,
          createdAt: team.createdAt,
          tournamentUpdates: team.tournamentUpdates || []
        }
      });
    }

  } catch (error) {
    console.error('Get team status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team status'
    });
  }
};
