const User = require('../models/User');
const Investment = require('../models/Investment');
const Withdrawal = require('../models/Withdrawal');

// Helper function to calculate daily interest for an investment
// Formula: (currentBalance * rate%) / 365 * daysSinceStart
// Uses full precision (no rounding) so paisa-level values are preserved
const calculateDailyInterest = (investment) => {
  const start = new Date(investment.startDate);
  const now = new Date();
  const diffTime = Math.max(0, now - start);
  const diffDays = diffTime / (1000 * 60 * 60 * 24); // fractional days for precision
  const rate = investment.interestRate || (investment.type === 'saving' ? 7 : 12);
  const dailyRate = (investment.amount * rate) / 100 / 365;
  return dailyRate * diffDays; // full precision, no rounding
};

// Get user balances – CORRECT DAILY CALCULATION
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

    // Calculate totals for SAVING (daily interest, full precision)
    const savingInvested = savingInvestments.reduce((acc, inv) => acc + inv.amount, 0);
    const savingInterest = savingInvestments.reduce((acc, inv) => acc + calculateDailyInterest(inv), 0);
    const savingWithdrawn = savingWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);
    let savingBalance = savingInvested + savingInterest - savingWithdrawn;
    if (savingBalance < 0) savingBalance = 0;

    // Calculate totals for FIXED (daily interest, full precision)
    const fixedInvested = fixedInvestments.reduce((acc, inv) => acc + inv.amount, 0);
    const fixedInterest = fixedInvestments.reduce((acc, inv) => acc + calculateDailyInterest(inv), 0);
    const fixedWithdrawn = fixedWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);
    let fixedBalance = fixedInvested + fixedInterest - fixedWithdrawn;
    if (fixedBalance < 0) fixedBalance = 0;

    // Calculate withdrawable fixed balance (only those older than 1 year)
    const withdrawableFixedInvested = fixedInvestments.filter(inv => {
      const diffDays = (new Date() - new Date(inv.startDate)) / (1000 * 60 * 60 * 24);
      return diffDays >= 365;
    }).reduce((acc, inv) => acc + inv.amount + calculateDailyInterest(inv), 0);

    const availableFixed = Math.max(0, withdrawableFixedInvested - fixedWithdrawn);
    const availableToWithdraw = savingBalance + availableFixed;

    // Total balance
    let totalBalance = savingBalance + fixedBalance;
    if (totalBalance < 0) totalBalance = 0;

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
      availableToWithdraw,
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

// Get detailed user data for admin dropdown
exports.getUserDetailByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const investments = await Investment.find({ userEmail: email, status: 'approved' });
    const withdrawals = await Withdrawal.find({ userEmail: email, status: 'paid' });

    const savingInvestments = investments.filter(inv => inv.type === 'saving');
    const fixedInvestments = investments.filter(inv => inv.type === 'fixed');
    const savingWithdrawals = withdrawals.filter(wd => wd.withdrawType === 'saving');
    const fixedWithdrawals = withdrawals.filter(wd => wd.withdrawType === 'fixed');

    const savingInvested = savingInvestments.reduce((acc, inv) => acc + inv.amount, 0);
    const savingInterest = savingInvestments.reduce((acc, inv) => acc + calculateDailyInterest(inv), 0);
    const savingWithdrawn = savingWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);
    const savingBalance = Math.max(0, savingInvested + savingInterest - savingWithdrawn);

    const fixedInvested = fixedInvestments.reduce((acc, inv) => acc + inv.amount, 0);
    const fixedInterest = fixedInvestments.reduce((acc, inv) => acc + calculateDailyInterest(inv), 0);
    const fixedWithdrawn = fixedWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);
    const fixedBalance = Math.max(0, fixedInvested + fixedInterest - fixedWithdrawn);

    const totalInvested = savingInvested + fixedInvested;
    const totalInterest = savingInterest + fixedInterest;
    const totalBalance = savingBalance + fixedBalance;

    // Available to Withdraw for detail
    const withdrawableFixedInvestedDetail = fixedInvestments.filter(inv => {
      const diffDays = (new Date() - new Date(inv.startDate)) / (1000 * 60 * 60 * 24);
      return diffDays >= 365;
    }).reduce((acc, inv) => acc + inv.amount + calculateDailyInterest(inv), 0);
    const availableToWithdrawDetail = savingBalance + Math.max(0, withdrawableFixedInvestedDetail - fixedWithdrawn);

    res.status(200).json({
      user,
      totalInvested,
      totalEarnings: totalInterest,
      currentBalance: totalBalance,
      availableToWithdraw: availableToWithdrawDetail,
      saving: {
        invested: savingInvested,
        interest: savingInterest,
        withdrawn: savingWithdrawn,
        balance: savingBalance,
        count: savingInvestments.length
      },
      fixed: {
        invested: fixedInvested,
        interest: fixedInterest,
        withdrawn: fixedWithdrawn,
        balance: fixedBalance,
        count: fixedInvestments.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user detail', error: error.message });
  }
};

// Admin: Get total payable balance across all users
exports.getTotalPayableBalance = async (req, res) => {
  try {
    const investments = await Investment.find({ status: 'approved' });
    const withdrawals = await Withdrawal.find({ status: 'paid' });

    let totalPayable = 0;

    // Get unique emails from investments
    const emails = [...new Set(investments.map(inv => inv.userEmail))];

    for (const email of emails) {
      const userInvestments = investments.filter(inv => inv.userEmail === email);
      const userWithdrawals = withdrawals.filter(wd => wd.userEmail === email);

      const totalInvested = userInvestments.reduce((acc, inv) => acc + inv.amount, 0);
      const totalInterest = userInvestments.reduce((acc, inv) => acc + calculateDailyInterest(inv), 0);
      const totalWithdrawn = userWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);

      const userBalance = Math.max(0, totalInvested + totalInterest - totalWithdrawn);
      totalPayable += userBalance;
    }

    res.status(200).json({ totalPayableBalance: totalPayable });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating total payable balance', error: error.message });
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
