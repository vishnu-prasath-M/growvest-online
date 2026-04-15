const Withdrawal = require('../models/Withdrawal');

exports.createWithdrawal = async (req, res) => {
  try {
    const { amount, upiId, userName, userEmail } = req.body;
    
    const newWithdrawal = new Withdrawal({
      amount,
      upiId,
      userName,
      userEmail,
      date: new Date().toLocaleDateString(),
      status: 'pending'
    });

    await newWithdrawal.save();
    res.status(201).json(newWithdrawal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating withdrawal', error: error.message });
  }
};

exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ createdAt: -1 });
    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching withdrawals', error: error.message });
  }
};

exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const withdrawal = await Withdrawal.findByIdAndUpdate(id, { status }, { new: true });
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    res.status(200).json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating withdrawal', error: error.message });
  }
};
