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
    console.log(`[WITHDRAWAL] Created withdrawal: ${newWithdrawal._id}, amount: ${amount}, user: ${userEmail}`);

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
        status: 'pending',
        referenceId: newWithdrawal._id,
        referenceType: 'Withdrawal',
        description: `Withdrawal request from ${withdrawType || 'saving'} deposit - ₹${amount}`
      });
      await transaction.save();
      console.log(`[WITHDRAWAL] Transaction created for withdrawal: ${newWithdrawal._id}`);
    } else {
      console.log(`[WITHDRAWAL] WARNING: User not found for email: ${userEmail}, transaction not created`);
    }

    res.status(201).json(newWithdrawal);
  } catch (error) {
    console.error('[WITHDRAWAL] Error creating withdrawal:', error);
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

    console.log(`[WITHDRAWAL] updateWithdrawalStatus called: id=${id}, status=${status}, paidAt=${paidAt}`);

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      console.log(`[WITHDRAWAL] ERROR: Withdrawal not found: ${id}`);
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    console.log(`[WITHDRAWAL] Found withdrawal: status=${withdrawal.status}, processed=${withdrawal.processed}, amount=${withdrawal.amount}, userEmail=${withdrawal.userEmail}`);

    const updateData = { status };
    if (paidAt) {
      updateData.paidAt = paidAt;
    }

    // When marking as paid (or approved = paid) - execute the full withdrawal logic
    const isPaidStatus = (status === 'paid' || status === 'approved');
    const wasAlreadyProcessed = (withdrawal.status === 'paid' || withdrawal.status === 'approved') && withdrawal.processed === true;

    if (isPaidStatus && !wasAlreadyProcessed) {
      console.log(`[WITHDRAWAL] Executing withdrawal processing for: ${id}`);

      // Find user
      const user = await User.findOne({ 
        $or: [{ email: withdrawal.userEmail }, { mobileNumber: withdrawal.userEmail }] 
      });

      if (!user) {
        console.log(`[WITHDRAWAL] ERROR: User not found for email: ${withdrawal.userEmail}`);
        // Still update the withdrawal status even if user not found
        const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(id, updateData, { new: true });
        return res.status(200).json(updatedWithdrawal);
      }

      console.log(`[WITHDRAWAL] User found: ${user._id}, current balance (DB field): ${user.balance}`);

      // Mark as processed first to prevent duplicate processing on retry
      updateData.processed = true;

      // Update withdrawal status with processed flag
      const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(id, updateData, { new: true });
      console.log(`[WITHDRAWAL] Withdrawal status updated to ${status}, processed=true`);

      // The balance is COMPUTED dynamically by getEnrichedUserData, so we don't need to
      // deduct from user.balance manually - the calculation already subtracts paid withdrawals.
      // However, update user.balance for immediate consistency (it gets recalculated on next profile fetch anyway)
      // Find all paid/approved withdrawals for this user to recalculate balance
      const withdrawalOrConditions = [];
      if (withdrawal.userEmail) withdrawalOrConditions.push({ userEmail: withdrawal.userEmail });
      if (user.mobileNumber) withdrawalOrConditions.push({ mobileNumber: user.mobileNumber });
      
      const Investment = require('../models/Investment');
      const allApprovedInvestments = await Investment.find({
        $or: withdrawalOrConditions,
        status: 'approved'
      });
      
      const allPaidWithdrawals = await Withdrawal.find({
        $or: withdrawalOrConditions,
        status: { $in: ['paid', 'approved'] },
        processed: true
      });

      const totalInvested = allApprovedInvestments.reduce((acc, inv) => acc + inv.amount, 0);
      const totalInterest = allApprovedInvestments.reduce((acc, inv) => acc + (inv.interestEarned || 0), 0);
      const totalWithdrawn = allPaidWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);
      const newBalance = Math.max(0, totalInvested + totalInterest - totalWithdrawn);
      
      await User.updateOne({ _id: user._id }, { $set: { balance: newBalance } });
      console.log(`[WITHDRAWAL] User balance updated to: ${newBalance}`);

      // Deduct withdrawal amount from user's approved investments of withdrawal.withdrawType
      const investOrConditions = [];
      if (withdrawal.userEmail) investOrConditions.push({ userEmail: withdrawal.userEmail });
      if (user.mobileNumber) investOrConditions.push({ mobileNumber: user.mobileNumber });

      const approvedInvestments = await Investment.find({
        $or: investOrConditions,
        status: 'approved',
        type: withdrawal.withdrawType
      }).sort({ startDate: 1 });

      let remainingWithdrawAmount = withdrawal.amount;
      console.log(`[WITHDRAWAL] Deducting ${withdrawal.amount} from ${approvedInvestments.length} investments of type ${withdrawal.withdrawType}`);

      for (const inv of approvedInvestments) {
        if (remainingWithdrawAmount <= 0) break;

        let updatedInterestEarned = inv.interestEarned || 0;
        let updatedAmount = inv.amount || 0;
        let updatedStatus = inv.status;

        // 1. Deduct from interest first
        if (remainingWithdrawAmount >= updatedInterestEarned) {
          remainingWithdrawAmount -= updatedInterestEarned;
          updatedInterestEarned = 0;
        } else {
          updatedInterestEarned -= remainingWithdrawAmount;
          remainingWithdrawAmount = 0;
        }

        // 2. Deduct from amount/principal next
        if (remainingWithdrawAmount > 0) {
          if (remainingWithdrawAmount >= updatedAmount) {
            remainingWithdrawAmount -= updatedAmount;
            updatedAmount = 0;
            updatedStatus = 'withdrawn';
          } else {
            updatedAmount -= remainingWithdrawAmount;
            remainingWithdrawAmount = 0;
          }
        }

        // Save the updated investment
        await Investment.updateOne(
          { _id: inv._id },
          { 
            $set: { 
              amount: updatedAmount, 
              interestEarned: updatedInterestEarned,
              status: updatedStatus
            } 
          }
        );
        console.log(`[WITHDRAWAL] Updated investment ${inv._id}: amount=${updatedAmount}, interest=${updatedInterestEarned}, status=${updatedStatus}`);
      }

      if (remainingWithdrawAmount > 0) {
        console.log(`[WITHDRAWAL] WARNING: Did not fully deduct from investments, remaining=${remainingWithdrawAmount}`);
      }

      // Update transaction record - mark as 'paid'
      const updatedTransaction = await Transaction.findOneAndUpdate(
        { referenceId: withdrawal._id, referenceType: 'Withdrawal' },
        { 
          status: 'paid',
          updatedAt: new Date(),
          description: `Withdrawal completed - ₹${withdrawal.amount}`
        },
        { new: true }
      );
      
      if (updatedTransaction) {
        console.log(`[WITHDRAWAL] Transaction updated to paid: ${updatedTransaction._id}`);
      } else {
        console.log(`[WITHDRAWAL] WARNING: No transaction found for referenceId=${withdrawal._id}, creating one`);
        // Create transaction if it doesn't exist
        await Transaction.create({
          userId: user._id,
          userEmail: withdrawal.userEmail,
          type: 'withdrawal',
          amount: withdrawal.amount,
          status: 'paid',
          referenceId: withdrawal._id,
          referenceType: 'Withdrawal',
          description: `Withdrawal completed - ₹${withdrawal.amount}`
        });
      }

      console.log(`[WITHDRAWAL] SUCCESS: Withdrawal ${id} fully processed`);
      res.status(200).json(updatedWithdrawal);
      
    } else if (isPaidStatus && wasAlreadyProcessed) {
      // Already processed, just update status
      console.log(`[WITHDRAWAL] Withdrawal ${id} already processed, skipping deduction`);
      const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(id, updateData, { new: true });
      res.status(200).json(updatedWithdrawal);
      
    } else {
      // For other statuses (rejected, pending)
      console.log(`[WITHDRAWAL] Non-paid status update: ${status}`);
      const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(id, updateData, { new: true });

      // Update transaction record for other statuses
      await Transaction.findOneAndUpdate(
        { referenceId: withdrawal._id, referenceType: 'Withdrawal' },
        { 
          status: status === 'rejected' ? 'rejected' : 'pending',
          updatedAt: new Date(),
          description: status === 'rejected'
            ? `Withdrawal rejected - ₹${withdrawal.amount}`
            : `Withdrawal requested - ₹${withdrawal.amount}`
        },
        { new: true }
      );

      res.status(200).json(updatedWithdrawal);
    }
  } catch (error) {
    console.error('[WITHDRAWAL] Error updating withdrawal:', error);
    res.status(500).json({ message: 'Error updating withdrawal', error: error.message });
  }
};