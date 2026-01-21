require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const SuperAdmin = require('./server/models/SuperAdmin');
const connectDB = require('./server/config/db');

const resetPassword = async () => {
    try {
        await connectDB();

        const username = 'superadmin';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Reset 'superadmin' user
        const result = await SuperAdmin.findOneAndUpdate(
            { username: { $regex: new RegExp(`^${username}$`, 'i') } },
            {
                password: hashedPassword,
                isActive: true
            },
            { upsert: true, new: true } // Create if not exists
        );

        console.log('✅ SuperAdmin verified/reset successfully!');
        console.log(`User: ${result.username}`);
        console.log(`Pass: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
};

resetPassword();
