const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  ref: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  type: {
    type: String,
    enum: ['saving', 'fixed'],
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// We won't persist totalInterest in DB, as requested.
// We can compute total interest when returning data using mongoose virtual or just doing it in controller.

module.exports = mongoose.model('Investment', investmentSchema);
