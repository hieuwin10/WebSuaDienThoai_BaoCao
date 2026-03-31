const mongoose = require('mongoose');
require('dotenv').config();
const userModel = require('./schemas/users');
const roleModel = require('./schemas/roles');

async function dump() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await userModel.find().populate('role');
    console.log('USERS IN DB:', JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
dump();
