/**
 * One-time correction script for withdrawal records where:
 * - Status = Paid / Approved
 * - processed = false or missing
 * 
 * These withdrawals had their status changed in Admin Dashboard
 * but the balance deduction, investment update, and transaction update
 * did NOT execute.
 * 
 * This script finds all such records and marks them as processed
 * while also updating all dependent data.
 * 
 * RUN WITH: node server/scripts/fixUnprocessedWithdrawals.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zenvest-dummy';

async function fixUnprocessedWithdrawals() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);

    const Withdrawal = require('../models/Withdrawal');
    const User = require('../models/User');
    const Investment = require('../models/Investment');
    const Transaction = require('../models/Transaction');

    // Find all paid/approved withdrawals that are NOT processed
    const unprocessedWithdrawals = await Withdrawal.find({
      status: { $in: ['paid', 'approved'] },
      $or: [
        { processed: { $exists: false } },
        { processed: false }
      ]
    });

    console.log(`\nFound ${unprocessedWithdrawals.length} unprocessed paid/approved withdrawals:\n`);

    for (const withdrawal of unprocessedWithdrawals) {
      console.log(`--- Processing withdrawal ${withdrawal._id} ---`);
      console.log(`  User: ${withdrawal.userEmail}`);
      console.log(`  Amount: ${withdrawal.amount}`);
      console.log(`  Type: ${withdrawal.withdrawType}`);
      console.log(`  Status: ${withdrawal.status}`);

      // Find user
      const user = await User.findOne({
        $or: [{ email: withdrawal.userEmail }, { mobileNumber: withdrawal.userEmail }]
      });

      if (!user) {
        console.log(`  ⚠ User not found, marking as processed without deduction`);
        await Withdrawal.updateOne({ _id: withdrawal._id }, { $set: { processed: true } });
        continue;
      }

      console.log(`  User found: ${user._id} (${user.name})`);

      // 1. Deduct from investments
      const investOrConditions = [];
      if (withdrawal.userEmail) investOrConditions.push({ userEmail: withdrawal.userEmail });
      if (user.mobileNumber) investOrConditions.push({ mobileNumber: user.mobileNumber });

      const approvedInvestments = await Investment.find({
        $or: investOrConditions,
        status: 'approved',
        type: withdrawal.withdrawType
      }).sort({ startDate: 1 });

      let remainingWithdrawAmount = withdrawal.amount;

      for (const inv of approvedInvestments) {
        if (remainingWithdrawAmount <= 0) break;

        let updatedInterestEarned = inv.interestEarned || 0;
        let updatedAmount = inv.amount || 0;
        let updatedStatus = inv.status;

        // Deduct from interest first
        if (remainingWithdrawAmount >= updatedInterestEarned) {
          remainingWithdrawAmount -= updatedInterestEarned;
          updatedInterestEarned = 0;
        } else {
          updatedInterestEarned -= remainingWithdrawAmount;
          remainingWithdrawAmount = 0;
        }

        // Deduct from principal next
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
        console.log(`  Updated investment ${inv._id}: amt=${updatedAmount}, int=${updatedInterestEarned}, status=${updatedStatus}`);
      }

      if (remainingWithdrawAmount > 0) {
        console.log(`  ⚠ Remaining amount not deducted: ${remainingWithdrawAmount}`);
      } else {
        console.log(`  ✅ Fully deducted from investments`);
      }

      // 2. Recalculate user balance
      const allUserInvOrConds = [];
      if (withdrawal.userEmail) allUserInvOrConds.push({ userEmail: withdrawal.userEmail });
      if (user.mobileNumber) allUserInvOrConds.push({ mobileNumber: user.mobileNumber });

      const allInvestments = await Investment.find({
        $or: allUserInvOrConds,
        status: 'approved'
      });

      let totalInterest = 0;
      for (const inv of allInvestments) {
        totalInterest += inv.interestEarned || 0;
      }

      const allPaidWithdrawals = await Withdrawal.find({
        $or: allUserInvOrConds,
        status: { $in: ['paid', 'approved'] }
      });

      const totalInvested = allInvestments.reduce((acc, inv) => acc + inv.amount, 0);
      const totalWithdrawn = allPaidWithdrawals.reduce((acc, wd) => acc + wd.amount, 0);
      const newBalance = Math.max(0, totalInvested + totalInterest - totalWithdrawn);

      await User.updateOne({ _id: user._id }, { $set: { balance: newBalance } });
      console.log(`  Balance recalculated: ${newBalance}`);

      // 3. Update transaction record
      const existingTransaction = await Transaction.findOneAndUpdate(
        { referenceId: withdrawal._id, referenceType: 'Withdrawal' },
        {
          status: 'paid',
          updatedAt: new Date(),
          description: `Withdrawal completed - ₹${withdrawal.amount}`
        },
        { new: true }
      );

      if (existingTransaction) {
        console.log(`  Transaction updated: ${existingTransaction._id}`);
      } else {
        // Create transaction if missing
        const newTransaction = await Transaction.create({
          userId: user._id,
          userEmail: withdrawal.userEmail,
          type: 'withdrawal',
          amount: withdrawal.amount,
          status: 'paid',
          referenceId: withdrawal._id,
          referenceType: 'Withdrawal',
          description: `Withdrawal completed - ₹${withdrawal.amount}`
        });
        console.log(`  Transaction created: ${newTransaction._id}`);
      }

      // 4. Mark as processed
      await Withdrawal.updateOne({ _id: withdrawal._id }, { $set: { processed: true } });
      console.log(`  ✅ Marked as processed`);
      console.log('');
    }

    console.log('\n=== Correction Complete ===');
    console.log(`Processed ${unprocessedWithdrawals.length} withdrawals`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixUnprocessedWithdrawals();