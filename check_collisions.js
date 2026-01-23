require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');
const Department = require('./server/models/Department');
const connectDB = require('./server/config/db');

async function checkCollisions() {
    await connectDB();
    console.log('--- Checking Credential Collisions ---');

    const employees = await Employee.find({}, 'username email department').lean();
    const departments = await Department.find({}, 'username name').lean();

    const deptUsernames = new Set(departments.map(d => (d.username || '').toLowerCase()));

    console.log('Detecting employees with usernames that match Department usernames:');
    let collisionCount = 0;
    for (const emp of employees) {
        if (emp.username && deptUsernames.has(emp.username.toLowerCase())) {
            console.log(`- Collision Found! Employee: "${emp.username}" (Dept in Record: ${emp.department}) matches a Department admin username.`);
            collisionCount++;
        }
    }

    if (collisionCount === 0) {
        console.log('No direct username collisions found between Employee and Department collections.');
    } else {
        console.log(`Total Collisions: ${collisionCount}`);
    }

    mongoose.disconnect();
}

checkCollisions().catch(console.error);
