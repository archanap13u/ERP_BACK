require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./server/models/Department');
const Employee = require('./server/models/Employee');
const connectDB = require('./server/config/db');

async function checkCollision(identifier) {
    await connectDB();
    console.log(`--- Checking Collision for: "${identifier}" ---`);

    const emp = await Employee.findOne({
        $or: [
            { username: identifier },
            { employeeId: identifier }
        ]
    }).lean();

    if (emp) {
        console.log(`[Employee] Found record! Name: ${emp.employeeName}, User: ${emp.username}, ID: ${emp.employeeId}`);
    } else {
        console.log('[Employee] NO RECORD FOUND.');
    }

    const dept = await Department.findOne({
        username: identifier
    }).lean();

    if (dept) {
        console.log(`[Department] Found record! Name: ${dept.name}, User: ${dept.username}, Panel: ${dept.panelType}`);
    } else {
        console.log('[Department] NO RECORD FOUND.');
    }

    mongoose.disconnect();
}

const id = process.argv[2] || 'EMP-2573';
checkCollision(id).catch(console.error);
