const User = require('../models/User');
const Investment = require('../models/Investment');
const Withdrawal = require('../models/Withdrawal');

// Helper function to calculate daily interest for an investment
// Formula: (currentBalance * rate%) / 365 * daysSinceStart
// Uses full precision (no rounding) so paisa-level values are preserved
// Helper function to sync interest for an investment (Feature 1 & 2)
const syncInvestmentInterest = async (inv) => {
  const startDate = new Date(inv.startDate);
  startDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Feature 2: Fix Existing Wrong Data (Reset once if version is not 2)
  if (inv.interestLogicVersion !== 2) {
    inv.interestEarned = 0;
    inv.interestLogicVersion = 2;
    // Set last calculated to start date to trigger catch-up calculation below
    inv.lastInterestCalculatedAt = startDate;
  }

  const lastCalcAt = inv.lastInterestCalculatedAt ? new Date(inv.lastInterestCalculatedAt) : startDate;
  lastCalcAt.setHours(0, 0, 0, 0);

  // Feature 5: Run Only Once Per Day
  if (today > lastCalcAt) {
    const diffTime = Math.max(0, today - lastCalcAt);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      const rate = inv.type === 'fixed' ? 12 : 7;
      // Formula: (investedAmount × annualRate) / 365
      const dailyInterest = (inv.amount * rate) / 100 / 365;
      
      // Cumulative Calculation: interest = interest + dailyInterest
      inv.interestEarned = (inv.interestEarned || 0) + (dailyInterest * diffDays);
      inv.lastInterestCalculatedAt = today;
      await inv.save();
    }
  }
  return inv.interestEarned || 0;
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

    // Run Sync Logic for each investment
    for (const inv of investments) {
      await syncInvestmentInterest(inv);
    }

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
    const savingInterest = savingInvestments.reduce((acc, inv) => acc + (inv.interestEarned || 0), 0);
    const savingWithdrawn = savingWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);
    let savingBalance = savingInvested + savingInterest - savingWithdrawn;
    if (savingBalance < 0) savingBalance = 0;

    // Calculate totals for FIXED
    const fixedInvested = fixedInvestments.reduce((acc, inv) => acc + inv.amount, 0);
    const fixedInterest = fixedInvestments.reduce((acc, inv) => acc + (inv.interestEarned || 0), 0);
    const fixedWithdrawn = fixedWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);
    let fixedBalance = fixedInvested + fixedInterest - fixedWithdrawn;
    if (fixedBalance < 0) fixedBalance = 0;

    const availableFixed = fixedInvestments.filter(inv => {
      const diffDays = (new Date() - new Date(inv.startDate)) / (1000 * 60 * 60 * 24);
      return diffDays >= 365;
    }).reduce((acc, inv) => acc + inv.amount + (inv.interestEarned || 0), 0);

    const availableToWithdraw = savingBalance + Math.max(0, availableFixed - fixedWithdrawn);

    // Total balance
    let totalBalance = savingBalance + fixedBalance;
    if (totalBalance < 0) totalBalance = 0;

    // Total calculations (Feature 3: Total Earnings)
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
    
    // Sync each before detail view
    for (const inv of investments) {
      await syncInvestmentInterest(inv);
    }

    const withdrawals = await Withdrawal.find({ userEmail: email, status: 'paid' });

    const savingInvestments = investments.filter(inv => inv.type === 'saving');
    const fixedInvestments = investments.filter(inv => inv.type === 'fixed');
    const savingWithdrawals = withdrawals.filter(wd => wd.withdrawType === 'saving');
    const fixedWithdrawals = withdrawals.filter(wd => wd.withdrawType === 'fixed');

    const savingInvested = savingInvestments.reduce((acc, inv) => acc + inv.amount, 0);
    const savingInterest = savingInvestments.reduce((acc, inv) => acc + (inv.interestEarned || 0), 0);
    const savingWithdrawn = savingWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);
    const savingBalance = Math.max(0, savingInvested + savingInterest - savingWithdrawn);

    const fixedInvested = fixedInvestments.reduce((acc, inv) => acc + inv.amount, 0);
    const fixedInterest = fixedInvestments.reduce((acc, inv) => acc + (inv.interestEarned || 0), 0);
    const fixedWithdrawn = fixedWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);
    const fixedBalance = Math.max(0, fixedInvested + fixedInterest - fixedWithdrawn);

    const totalInvested = savingInvested + fixedInvested;
    const totalInterest = savingInterest + fixedInterest;
    const totalBalance = savingBalance + fixedBalance;

    const withdrawableFixed = fixedInvestments.filter(inv => {
      const diffDays = (new Date() - new Date(inv.startDate)) / (1000 * 60 * 60 * 24);
      return diffDays >= 365;
    }).reduce((acc, inv) => acc + inv.amount + (inv.interestEarned || 0), 0);
    
    const availableToWithdrawDetail = savingBalance + Math.max(0, withdrawableFixed - fixedWithdrawn);

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
    const emails = [...new Set(investments.map(inv => inv.userEmail))];

    for (const email of emails) {
      const userInvestments = investments.filter(inv => inv.userEmail === email);
      const userWithdrawals = withdrawals.filter(wd => wd.userEmail === email);

      // Sync user investments even for admin view
      let userInterest = 0;
      for (const inv of userInvestments) {
        userInterest += await syncInvestmentInterest(inv);
      }

      const totalInvested = userInvestments.reduce((acc, inv) => acc + inv.amount, 0);
      const totalWithdrawn = userWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);

      const userBalance = Math.max(0, totalInvested + userInterest - totalWithdrawn);
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
    const user = await User.findOneAndUpdate({ email }, { balance }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating balance', error: error.message });
  }
};

// Get all users (for admin) with accurate balances and earnings
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Enrich users with current stats
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      if (user.role === 'admin') return user.toObject();

      const investments = await Investment.find({ userEmail: user.email, status: 'approved' });
      
      let totalInterest = 0;
      for (const inv of investments) {
        totalInterest += await syncInvestmentInterest(inv);
      }
      
      const withdrawals = await Withdrawal.find({ userEmail: user.email, status: 'paid' });
      
      const totalInvested = investments.reduce((acc, inv) => acc + inv.amount, 0);
      const totalWithdrawn = withdrawals.reduce((acc, wd) => acc + wd.amount, 0);
      
      const currentBalance = Math.max(0, totalInvested + totalInterest - totalWithdrawn);
      
      // Update balance if changed
      if (user.balance !== currentBalance) {
        user.balance = currentBalance;
        await user.save();
      }

      return {
        ...user.toObject(),
        totalInvested,
        totalEarnings: totalInterest,
        currentBalance
      };
    }));

    res.status(200).json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};
