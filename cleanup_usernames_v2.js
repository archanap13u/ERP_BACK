require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');
const connectDB = require('./server/config/db');

async function fixUsernames() {
    await connectDB();
    console.log('--- Fixing Empty Usernames ---');

    const employees = await Employee.find({
        $or: [
            { username: null },
            { username: { $exists: false } },
            { username: '' }
        ]
    });

    for (const emp of employees) {
        try {
            const targetUsername = emp.employeeId || `EMP-${emp._id.toString().slice(-4)}`;
            console.log(`Setting ${emp.employeeName} username to ${targetUsername}`);
            await Employee.updateOne({ _id: emp._id }, { $set: { username: targetUsername } });
        } catch (e) {
            console.error(`Failed to update ${emp.employeeName}: ${e.message}`);
        }
    }

    console.log('Cleanup complete.');
    mongoose.disconnect();
}

fixUsernames().catch(console.error);
