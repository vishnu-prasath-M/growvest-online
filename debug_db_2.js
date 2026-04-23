const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Investment = require('./server/models/Investment');
const User = require('./server/models/User');

dotenv.config({ path: './server/.env' });

const dbUri = process.env.MONGO_URI;

mongoose.connect(dbUri)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const users = await User.find();
    console.log('\n--- Users ---');
    users.forEach(u => console.log(`${u.name} (${u.email}): Balance=${u.balance}, Role=${u.role}`));
    
    const investments = await Investment.find({ status: 'approved' });
    console.log('\n--- Approved Investments ---');
    investments.forEach(i => console.log(`${i.userName} (${i.userEmail}): Amount=${i.amount}, Type=${i.type}, Interest=${i.interestEarned}`));
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Connection error:', err);
  });
