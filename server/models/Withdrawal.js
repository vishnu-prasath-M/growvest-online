const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  upiId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  date: {
    type: String, // String for easier display on frontend matching previous logic
  }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
