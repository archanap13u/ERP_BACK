require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');
const connectDB = require('./server/config/db');

async function fixUsernames() {
    await connectDB();
    console.log('--- Fixing Empty Usernames ---');

    // Find employees where username is null, undefined, or empty string
    const employees = await Employee.find({
        $or: [
            { username: null },
            { username: { $exists: false } },
            { username: '' }
        ]
    });

    console.log(`Found ${employees.length} employees with missing/empty usernames.`);

    for (const emp of employees) {
        if (emp.employeeId) {
            emp.username = emp.employeeId;
            await emp.save();
            console.log(`Updated Employee ${emp.employeeName} (${emp.employeeId}) with username: ${emp.username}`);
        } else {
            console.warn(`Employee ${emp.employeeName} has neither username nor employeeId! Skipping.`);
        }
    }

    console.log('Cleanup complete.');
    mongoose.disconnect();
}

fixUsernames().catch(console.error);
