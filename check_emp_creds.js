require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');
const connectDB = require('./server/config/db');

async function checkCreds() {
    await connectDB();
    console.log('--- Checking All Employees ---');
    const employees = await Employee.find({}).lean();

    employees.forEach(emp => {
        console.log(`ID: "${emp.employeeId}" | Name: "${emp.employeeName}" | Pwd: "${emp.password}"`);
    });

    mongoose.disconnect();
}

checkCreds().catch(console.error);
