const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Investment = require('../models/Investment');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');

const clearAllData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/growvest');
    console.log('Connected to MongoDB');

    // Clear all collections
    console.log('Clearing Investment collection...');
    await Investment.deleteMany({});
    console.log('✓ Investments cleared');

    console.log('Clearing Withdrawal collection...');
    await Withdrawal.deleteMany({});
    console.log('✓ Withdrawals cleared');

    console.log('Clearing Transaction collection...');
    await Transaction.deleteMany({});
    console.log('✓ Transactions cleared');

    console.log('\n✅ All data cleared successfully!');
    console.log('You can now start fresh with correct calculations.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  clearAllData();
}

module.exports = clearAllData;
