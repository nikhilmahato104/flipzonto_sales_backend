// insertadmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB Error:', err));

// Single admin details
const adminEmail = 'akashchandan@flipzonto.com';
const adminPassword = 'AkashChandan@123';

const createDefaultAdmin = async () => {
  const existing = await Admin.findOne({ email: adminEmail });
  if (!existing) {
    const hashedPwd = await bcrypt.hash(adminPassword, 12);
    await Admin.create({ email: adminEmail, password: hashedPwd });
    console.log(`✅ Default admin created: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Admin already exists: ${adminEmail}`);
  }

  mongoose.connection.close();
};

createDefaultAdmin();
