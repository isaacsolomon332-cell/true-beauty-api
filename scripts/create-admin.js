require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');  // adjust path if needed
const connectDB = require('../config/db');

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@trueface.com';
    const adminPassword = 'Admin@123';  // change to your secure password

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(' Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await Admin.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'superadmin'
    });

    console.log(' Super Admin created successfully!');
    console.log(` Email: ${admin.email}`);
    console.log(` Password: ${adminPassword}`);
    console.log('  Save this password securely.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();