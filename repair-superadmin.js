require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const SuperAdmin = require('./server/models/SuperAdmin');
const connectDB = require('./server/config/db');

const repairAdmin = async () => {
    try {
        await connectDB();

        const username = 'admin';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await SuperAdmin.findOneAndUpdate(
            { username: { $regex: new RegExp(`^${username}$`, 'i') } },
            {
                password: hashedPassword,
                isActive: true,
                fullName: 'System Administrator',
                email: 'admin@system.com'
            },
            { upsert: true, new: true }
        );

        console.log('✅ SuperAdmin repaired/created successfully!');
        console.log('Username:', result.username);
        console.log('Password: admin123 (reset successfully)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error repairing SuperAdmin:', error);
        process.exit(1);
    }
};

repairAdmin();
