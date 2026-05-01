const mongoose = require('mongoose');
require('dotenv').config();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test_db');
  }
});

afterAll(async () => {
  // Option: Drop database after tests if needed
  // await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});
