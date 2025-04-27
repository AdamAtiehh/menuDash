// createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('../BillzCafe-main/models/Admin');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const username = 'admin';
    const password = 'password123'; // CHANGE THIS TO SOMETHING STRONG

    const existing = await Admin.findOne({ username });
    if (existing) {
      console.log('Admin already exists.');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({ username, password: hashedPassword });
    console.log(`✅ Admin user created: ${username}`);
    process.exit();
  })
  .catch(err => {
    console.error('MongoDB error:', err);
    process.exit(1);
  });
