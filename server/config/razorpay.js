const Razorpay = require("razorpay");

// Dummy keys - User MUST replace these in process.env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_xxxxx",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "xxxxxxxx"
});

module.exports = razorpay;


