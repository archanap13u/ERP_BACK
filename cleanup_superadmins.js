const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const SuperAdminSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    fullName: String,
    isActive: Boolean
}, { strict: false });

const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema);

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_mern');
        console.log('Connected to DB');

        // Remove records where username or password is missing
        const result = await SuperAdmin.deleteMany({
            $or: [
                { username: { $exists: false } },
                { username: null },
                { username: "undefined" },
                { password: { $exists: false } },
                { password: null }
            ]
        });

        console.log(`Successfully removed ${result.deletedCount} corrupted SuperAdmin records.`);

        await mongoose.disconnect();
    } catch (e) {
        console.error('Cleanup failed:', e);
    }
}

cleanup();
