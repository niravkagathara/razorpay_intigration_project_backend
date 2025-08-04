const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  teamName: String,
  leaderName: String,
  leaderEmail: String,
  mobileNumber: String,
  amount: Number,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
