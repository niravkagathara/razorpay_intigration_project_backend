const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const sendEmail = require('../utils/emailService');

// Get all teams for admin dashboard
router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      teams: teams.map(team => ({
        id: team._id,
        teamName: team.teamName,
        leaderName: team.leaderName,
        leaderEmail: team.leaderEmail,
        teamSize: team.teamSize,
        verificationStatus: team.verificationStatus,
        createdAt: team.createdAt,
        members: team.members
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teams'
    });
  }
});

// Verify team
router.post('/verify-team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { verifiedBy } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    team.verificationStatus = 'verified';
    team.verificationDate = new Date();
    team.verifiedBy = verifiedBy;
    await team.save();

    // Send verification email to all team members
    const allEmails = [team.leaderEmail, ...team.members.map(member => member.email)];
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a, #2d2d2d); color: white; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #fbbf24; margin: 0;">🔥 FREE FIRE TOURNAMENT 🔥</h1>
          <h2 style="color: #10b981; margin: 10px 0;">✅ Team Verified!</h2>
        </div>
        
        <div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #10b981; margin-top: 0;">🎉 Congratulations!</h3>
          <p style="color: #d1d5db;">Your team <strong>${team.teamName}</strong> has been successfully verified by the tournament admin.</p>
          
          <div style="margin: 15px 0;">
            <strong style="color: #fbbf24;">Team Details:</strong><br>
            <strong>Team Name:</strong> ${team.teamName}<br>
            <strong>Team Leader:</strong> ${team.leaderName}<br>
            <strong>Team Size:</strong> ${team.teamSize} Players<br>
            <strong>Verification Date:</strong> ${new Date().toLocaleDateString()}<br>
            <strong>Verified By:</strong> ${verifiedBy}
          </div>
        </div>
        
        <div style="background: rgba(59, 130, 246, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="color: #3b82f6; margin-top: 0;">📋 Next Steps:</h4>
          <ul style="color: #d1d5db;">
            <li>Your team is now officially registered for the tournament</li>
            <li>You will receive tournament schedule and match details</li>
            <li>Make sure all team members are available on tournament day</li>
            <li>Check your email regularly for important updates</li>
          </ul>
        </div>
        
        <div style="background: rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 8px;">
          <h4 style="color: #ef4444; margin-top: 0;">⚠️ Important Reminders:</h4>
          <ul style="color: #d1d5db;">
            <li>Tournament Date: 15th December 2025</li>
            <li>Tournament Time: 2:00 PM IST</li>
            <li>All team members must be present</li>
            <li>Stable internet connection required</li>
            <li>Follow tournament rules strictly</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
          <p style="color: #9ca3af; margin: 0;">🎮 Free Fire Pro Championship 2025</p>
          <p style="color: #6b7280; margin: 5px 0;">Good luck and have fun!</p>
        </div>
      </div>
    `;

    // Send email to all team members
    for (const email of allEmails) {
      await sendEmail({
        to: email,
        subject: '✅ Free Fire Tournament - Team Verified!',
        html: emailContent
      });
    }

    res.json({
      success: true,
      message: 'Team verified successfully'
    });

  } catch (error) {
    console.error('Team verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Team verification failed'
    });
  }
});

// Send tournament update to all teams
router.post('/send-update', async (req, res) => {
  try {
    const { message, subject, selectedTeams } = req.body;

    let teams;
    if (selectedTeams && selectedTeams.length > 0) {
      // Send to selected teams
      teams = await Team.find({ _id: { $in: selectedTeams } });
    } else {
      // Send to all teams
      teams = await Team.find({ verificationStatus: 'verified' });
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a, #2d2d2d); color: white; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #fbbf24; margin: 0;">🔥 FREE FIRE TOURNAMENT 🔥</h1>
          <h2 style="color: #3b82f6; margin: 10px 0;">📢 Tournament Update</h2>
        </div>
        
        <div style="background: rgba(59, 130, 246, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #3b82f6; margin-top: 0;">📋 Important Update</h3>
          <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="color: #d1d5db; margin: 0; line-height: 1.6;">${message}</p>
          </div>
        </div>
        
        <div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 8px;">
          <h4 style="color: #10b981; margin-top: 0;">📅 Tournament Details:</h4>
          <ul style="color: #d1d5db;">
            <li><strong>Date:</strong> 15th December 2025</li>
            <li><strong>Time:</strong> 2:00 PM IST</li>
            <li><strong>Format:</strong> Squad (4 Players)</li>
            <li><strong>Prize Pool:</strong> ₹50,000</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
          <p style="color: #9ca3af; margin: 0;">🎮 Free Fire Pro Championship 2025</p>
          <p style="color: #6b7280; margin: 5px 0;">Stay tuned for more updates!</p>
        </div>
      </div>
    `;

    // Send email to all verified teams
    for (const team of teams) {
      const allEmails = [team.leaderEmail, ...team.members.map(member => member.email)];
      
      for (const email of allEmails) {
        await sendEmail({
          to: email,
          subject: `📢 Free Fire Tournament - ${subject}`,
          html: emailContent
        });
      }

      // Add update to team's tournament updates
      team.tournamentUpdates.push({ 
        message: message,
        date: new Date()
      });
      await team.save();
    }

    res.json({
      success: true,
      message: `Update sent to ${teams.length} teams`
    });

  } catch (error) {
    console.error('Send update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send update'
    });
  }
});

// Get tournament statistics
router.get('/stats', async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments();
    const verifiedTeams = await Team.countDocuments({ verificationStatus: 'verified' });
    const pendingTeams = await Team.countDocuments({ verificationStatus: 'pending' });

    res.json({
      success: true,
      stats: {
        totalTeams,
        verifiedTeams,
        pendingTeams
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    });
  }
});

module.exports = router; 