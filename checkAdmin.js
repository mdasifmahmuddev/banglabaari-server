const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const Admin = require('./models/Admin');
    
   
    const allAdmins = await Admin.find({});
    console.log('📋 All admins in database:');
    allAdmins.forEach((admin, i) => {
      console.log(`${i + 1}. Username: ${admin.username}, Email: ${admin.email}`);
    });
    console.log('');

    
    const admin = await Admin.findOne({ email: 'admin@banglabaari.com' });
    
    if (admin) {
      console.log('✓ Found admin by email:', {
        currentUsername: admin.username,
        email: admin.email,
        role: admin.role
      });
      console.log('');

       
      console.log('🔧 Updating admin credentials...');
      admin.username = process.env.ADMIN_USERNAME;
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      admin.password = hashedPassword;
      await admin.save();
      
      console.log('✓ Admin updated successfully!');
      console.log('New credentials:');
      console.log('  Username:', admin.username);
      console.log('  Password: (from .env file)');
    } else {
      console.log('✗ No admin found with email admin@banglabaari.com');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdmin();