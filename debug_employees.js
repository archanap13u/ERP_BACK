require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');
const connectDB = require('./server/config/db');

async function listEmployees() {
    await connectDB();
    console.log('--- Listing All Employees ---');
    const employees = await Employee.find({}, 'employeeId employeeName username email').lean();

    if (employees.length === 0) {
        console.log('No employees found in the database.');
    } else {
        employees.forEach(emp => {
            console.log(`ID: "${emp.employeeId}" | Name: "${emp.employeeName}" | Username: "${emp.username}" | Email: "${emp.email}"`);
        });
    }

    mongoose.disconnect();
}

listEmployees().catch(console.error);
