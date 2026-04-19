const User = require('../models/User');
const Investment = require('../models/Investment');
const Withdrawal = require('../models/Withdrawal');

// Helper function to calculate months between dates
const calculateMonths = (startDate) => {
  const start = new Date(startDate);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(0, months);
};

// Helper function to calculate interest for an investment
const calculateInterest = (investment) => {
  const months = calculateMonths(investment.startDate);
  const rate = investment.interestRate || (investment.type === 'saving' ? 7 : 12);
  const interest = (investment.amount * rate * months) / 100 / 12;
  return Math.round(interest);
};

// Get user balances - CORRECT CALCULATION
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all approved investments
    const investments = await Investment.find({ 
      userEmail: email, 
      status: 'approved' 
    });

    // Get all paid withdrawals
    const withdrawals = await Withdrawal.find({ 
      userEmail: email, 
      status: 'paid' 
    });

    // Separate by type
    const savingInvestments = investments.filter(inv => inv.type === 'saving');
    const fixedInvestments = investments.filter(inv => inv.type === 'fixed');

    const savingWithdrawals = withdrawals.filter(wd => wd.withdrawType === 'saving');
    const fixedWithdrawals = withdrawals.filter(wd => wd.withdrawType === 'fixed');

    // Calculate totals for SAVING
    const savingInvested = savingInvestments.reduce((acc, inv) => acc + inv.amount, 0);
    const savingInterest = savingInvestments.reduce((acc, inv) => acc + calculateInterest(inv), 0);
    const savingWithdrawn = savingWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);
    let savingBalance = savingInvested + savingInterest - savingWithdrawn;
    if (savingBalance < 0) savingBalance = 0; // Prevent negative

    // Calculate totals for FIXED
    const fixedInvested = fixedInvestments.reduce((acc, inv) => acc + inv.amount, 0);
    const fixedInterest = fixedInvestments.reduce((acc, inv) => acc + calculateInterest(inv), 0);
    const fixedWithdrawn = fixedWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);
    let fixedBalance = fixedInvested + fixedInterest - fixedWithdrawn;
    if (fixedBalance < 0) fixedBalance = 0; // Prevent negative

    // Total balance
    let totalBalance = savingBalance + fixedBalance;
    if (totalBalance < 0) totalBalance = 0; // Prevent negative

    // Total calculations
    const totalInvested = savingInvested + fixedInvested;
    const totalInterest = savingInterest + fixedInterest;
    const totalWithdrawn = savingWithdrawn + fixedWithdrawn;

    res.status(200).json({
      ...user.toObject(),
      balance: totalBalance,
      totalBalance,
      savingBalance,
      fixedBalance,
      totalInvested,
      totalInterest,
      totalWithdrawn,
      saving: {
        invested: savingInvested,
        interest: savingInterest,
        withdrawn: savingWithdrawn,
        balance: savingBalance
      },
      fixed: {
        invested: fixedInvested,
        interest: fixedInterest,
        withdrawn: fixedWithdrawn,
        balance: fixedBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user balance
exports.updateBalance = async (req, res) => {
  try {
    const { email } = req.params;
    const { balance } = req.body;
    
    const user = await User.findOneAndUpdate(
      { email },
      { balance },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating balance', error: error.message });
  }
};

// Get all users (for admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};
