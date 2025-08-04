// models/Team.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  gameId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

const teamSchema = new mongoose.Schema({
  leaderName: {
    type: String,
    required: true
  },
  leaderEmail: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: true
  },
  teamName: {
    type: String,
    required: true,
    unique: true
  },
  teamSize: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  members: [memberSchema],
  registrationToken: {
    type: String,
    unique: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDate: {
    type: Date
  },
  verifiedBy: {
    type: String
  },
  tournamentUpdates: [{
    message: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
teamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Team', teamSchema);
