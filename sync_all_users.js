require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');
const connectDB = require('./server/config/db');

async function run() {
    await connectDB();
    const emps = await Employee.find();
    console.log(`Checking ${emps.length} employees...`);

    for (const e of emps) {
        if (e.employeeId && e.username !== e.employeeId) {
            console.log(`Syncing ${e.employeeName}: ${e.username} -> ${e.employeeId}`);
            try {
                await Employee.updateOne({ _id: e._id }, { $set: { username: e.employeeId } });
            } catch (err) {
                console.error(`Collision for ${e.employeeName} on ${e.employeeId}: ${err.message}`);
            }
        }
    }
    console.log('All employees synced.');
    process.exit();
}
run().catch(console.error);
