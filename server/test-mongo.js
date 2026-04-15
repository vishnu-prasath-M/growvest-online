const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://vishnuprasath:8925699005@grow-clust.bynj9dx.mongodb.net/zenvest?appName=Grow-Clust";
mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB SUCCESS');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection ERROR:', err.message);
    process.exit(1);
  });
