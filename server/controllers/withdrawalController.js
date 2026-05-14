const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.createWithdrawal = async (req, res) => {
  try {
    const { amount, upiId, userName, userEmail, withdrawType } = req.body;
    
    const newWithdrawal = new Withdrawal({
      amount,
      upiId,
      userName,
      userEmail,
      date: new Date().toLocaleDateString(),
      status: 'pending',
      withdrawType: withdrawType || 'saving'
    });

    await newWithdrawal.save();

    // Create transaction record
    const user = await User.findOne({ 
      $or: [{ email: userEmail }, { mobileNumber: userEmail }] 
    });
    if (user) {
      const transaction = new Transaction({
        userId: user._id,
        userEmail,
        type: 'withdrawal',
        amount,
        status: 'requested',
        referenceId: newWithdrawal._id,
        referenceType: 'Withdrawal',
        description: `Withdrawal request from ${withdrawType || 'saving'} deposit - ₹${amount}`
      });
      await transaction.save();
    }

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
    const { status, paidAt } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    const updateData = { status };
    if (paidAt) {
      updateData.paidAt = paidAt;
    }

    // Update withdrawal status
    const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(id, updateData, { new: true });

    // Update user balance and transaction when withdrawal is paid
    if (status === 'paid' && withdrawal.status !== 'paid') {
      const user = await User.findOne({ 
        $or: [{ email: withdrawal.userEmail }, { mobileNumber: withdrawal.userEmail }] 
      });
      if (user) {
        // Deduct from user balance
        user.balance -= withdrawal.amount;
        await user.save();

        // Update transaction record
        await Transaction.findOneAndUpdate(
          { referenceId: withdrawal._id, referenceType: 'Withdrawal' },
          { 
            status: 'paid',
            updatedAt: new Date(),
            description: `Withdrawal completed - ₹${withdrawal.amount}`
          },
          { new: true }
        );
      }
    } else if (status === 'approved') {
      // Update transaction record for approval
      await Transaction.findOneAndUpdate(
        { referenceId: withdrawal._id, referenceType: 'Withdrawal' },
        { 
          status: 'approved',
          updatedAt: new Date(),
          description: `Withdrawal approved - ₹${withdrawal.amount}`
        },
        { new: true }
      );
    }

    res.status(200).json(updatedWithdrawal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating withdrawal', error: error.message });
  }
};
