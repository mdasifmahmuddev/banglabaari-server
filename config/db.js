const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    await createInitialAdmin();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    cached.promise = null;
    throw error;
  }

  return cached.conn;
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
      
      console.log('Initial admin user created');
    }
  } catch (error) {
    console.error('Error creating initial admin:', error.message);
  }
};

module.exports = connectDB;
 
 