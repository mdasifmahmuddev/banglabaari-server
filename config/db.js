const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(` MongoDB Connected: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);

  
    await createInitialAdmin();

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};


const createInitialAdmin = async () => {
  try {
    const Admin = require('../models/Admin');
    const existingAdmin = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    
    if (!existingAdmin) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      
      await Admin.create({
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
        email: 'admin@banglabaari.com',
        role: 'superadmin'
      });
      
      console.log(' Initial admin user created');
    }
  } catch (error) {
    console.error('Error creating initial admin:', error.message);
  }
};

module.exports = connectDB;