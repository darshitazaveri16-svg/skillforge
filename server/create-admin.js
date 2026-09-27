import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import User from './src/models/User.js';

dotenv.config();

async function createAdminUser() {
  console.log('\n===============================================================');
  console.log('         SKILLFORGE — ADMIN USER CREATION SCRIPT               ');
  console.log('===============================================================\n');

  try {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      console.error('[Error] Could not connect to MongoDB database.');
      process.exit(1);
    }

    const adminName = process.env.ADMIN_NAME || process.argv[2] || 'SkillForge Administrator';
    const adminEmail = (process.env.ADMIN_EMAIL || process.argv[3] || 'admin@skillforge.test').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || process.argv[4] || 'AdminPass123!';

    if (adminPassword.length < 6) {
      console.error('[Error] Password must be at least 6 characters long.');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      admin.name = adminName;
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
      console.log(`[Success] Existing user "${adminEmail}" was updated to role: "admin".`);
    } else {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
      });
      console.log(`[Success] Created new admin user: "${adminEmail}" with ID: ${admin._id}`);
    }

    console.log('[Admin Ready] You can now log in via the SkillForge login page or API.');
  } catch (error) {
    console.error('[Error] Failed to create admin user:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('[Database] Disconnected cleanly.\n');
    }
  }
}

createAdminUser();
