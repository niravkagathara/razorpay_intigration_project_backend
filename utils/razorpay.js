const Razorpay = require('razorpay');
const dotenv = require('dotenv');
dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
  // key: "LIVE_KEY_ID", // replace with your live key
  // amount: 10, // e.g., ₹500.00
  currency: "INR",
  name: "turnament",
  description: "Order Payment",
  // image: "https://yourdomain.com/logo.png",
  // order_id: "order_ID_generated_from_backend", 
  // handler: function (response) {
  //     // Handle payment success
  //     console.log(response);
  // },
  prefill: {
      name: "nirav",
      email: "niravkagathara4@gmail.com",
      contact: "9313442489",
  },
  notes: {
      address: "rajkot gujarat"
  },
  theme: {
      color: "#3399cc"
  }
});

module.exports = instance;
