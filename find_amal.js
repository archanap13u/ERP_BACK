const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    console.log('--- Searching Employees ---');
    const employees = await db.collection('employees').find({
        $or: [
            { employeeName: /Amal/i },
            { username: /Amal/i }
        ]
    }).toArray();
    console.log('Found Employees:', JSON.stringify(employees, null, 2));

    console.log('\n--- Searching Departments ---');
    const departments = await db.collection('departments').find({
        $or: [
            { name: /Finance/i }
        ]
    }).toArray();
    console.log('Found Departments:', JSON.stringify(departments, null, 2));

    process.exit();
}

run();
