require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const investmentRoutes = require('./routes/investmentRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Dummy Mongo URL since user will add later
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zenvest-dummy';

// Fix for Node.js DNS SRV lookup issues on Windows
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB (Dummy/Local)'))
  .catch(err => console.error('MongoDB connection error:', err));

const authRoutes = require('./routes/authRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');

app.use('/api/investments', investmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/withdrawals', withdrawalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
