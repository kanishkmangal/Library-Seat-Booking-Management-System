import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createAdmin = async () => {
  try {
    // Validate MongoDB URI
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not set in .env file');
      console.error('Please create a .env file in the backend directory with MONGODB_URI');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log(`Database: ${process.env.MONGODB_URI.split('/').pop()}`);

    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin user already exists. Updating to admin role...');
      existingAdmin.role = 'admin';
      existingAdmin.password = await bcrypt.hash(password, 12);
      await existingAdmin.save();
      console.log('Admin user updated successfully!');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      process.exit(0);
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();

