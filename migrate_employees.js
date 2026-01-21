const mongoose = require('mongoose');
require('dotenv').config();
const Employee = require('./server/models/Employee');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Update all employees who don't have a verificationStatus to 'Verified'
        // This ensures existing users aren't locked out.
        const res = await Employee.updateMany(
            { verificationStatus: { $exists: false } }, // Or $ne: 'Pending' if needed, but better safe.
            { $set: { verificationStatus: 'Verified' } }
        );

        console.log(`Migration Complete. Matched ${res.matchedCount}, Modified ${res.modifiedCount}`);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

migrate();
