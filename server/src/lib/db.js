const mongoose = require('mongoose');

let connectionPromise = null;

async function connectToDatabase() {
  if (connectionPromise) return connectionPromise;
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/job_importer';
  mongoose.set('strictQuery', true);
  connectionPromise = mongoose.connect(mongoUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
  });
  await connectionPromise;
  return mongoose.connection;
}

module.exports = { connectToDatabase };


