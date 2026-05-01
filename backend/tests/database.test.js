const mongoose = require('mongoose');
require('dotenv').config();

describe('Database Connection Test', () => {
  it('should connect to MongoDB successfully', async () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 means connected
  });

  it('should be able to ping the database', async () => {
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    expect(result).toHaveProperty('ok', 1);
  });
});
