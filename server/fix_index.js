const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(__dirname, '.env') });

const dbUri = process.env.MONGO_URI;

async function fix() {
  try {
    await mongoose.connect(dbUri);
    console.log('Connected');
    
    const collection = mongoose.connection.db.collection('users');
    
    console.log('Indexes before:');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));
    
    if (indexes.find(i => i.name === 'email_1')) {
      console.log('Dropping email_1 index...');
      await collection.dropIndex('email_1');
      console.log('Dropped');
    }
    
    console.log('Recreating sparse email index...');
    await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('Created');
    
    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error(err);
  }
}

fix();
