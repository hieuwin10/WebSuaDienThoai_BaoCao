const mongoose = require('mongoose');
require('dotenv').config();

console.log('Connecting to:', process.env.MONGO_URI);

const timeout = setTimeout(() => {
  console.log('Connection timed out after 10s');
  process.exit(1);
}, 10000);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected!');
    clearTimeout(timeout);
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err.message);
    process.exit(1);
  });
