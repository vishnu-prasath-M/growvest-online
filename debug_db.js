const mongoose = require('mongoose');
const Investment = require('./server/models/Investment');
const User = require('./server/models/User');

const MONGO_URI = 'mongodb+srv://vishnuprasath:8925699005@grow-clust.bynj9dx.mongodb.net/zenvest?appName=Grow-Clust';

async function debug() {
  await mongoose.connect(MONGO_URI);
  console.log('--- INVESTMENTS ---');
  const invs = await Investment.find().limit(5);
  invs.forEach(i => console.log(`ID: ${i._id}, Ref: ${i.ref}, User: ${i.userName}, Email: ${i.userEmail}`));

  console.log('--- USERS ---');
  const users = await User.find().limit(5);
  users.forEach(u => console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}`));

  await mongoose.disconnect();
}

debug();
