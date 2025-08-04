const express = require('express');
const router = express.Router();
  const Razorpay = require('../utils/razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');

router.post('/create-order', async (req, res) => {
  const { amount, teamName, leaderName, leaderEmail, mobileNumber } = req.body;

  try {
    const options = {
      amount: amount * 100, // in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await Razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error creating Razorpay order' });
  }
});

router.post('/verify', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    teamName,
    leaderName,
    leaderEmail,
    mobileNumber,
    amount,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    const payment = new Payment({
      teamName,
      leaderName,
      leaderEmail,
      mobileNumber,
      amount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'success'
    });

    await payment.save();

    res.json({ success: true, message: 'Payment verified and saved!' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid Signature' });
  }
});

module.exports = router;
