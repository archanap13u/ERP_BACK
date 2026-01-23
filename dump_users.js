require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');
const Department = require('./server/models/Department');
const connectDB = require('./server/config/db');

async function run() {
    await connectDB();
    const emps = await Employee.find({}, 'employeeId username employeeName password').lean();
    console.log('--- ALL EMPLOYEES ---');
    emps.forEach(e => console.log(`ID: ${e.employeeId}, User: ${e.username}, Name: ${e.employeeName}, Pwd: ${e.password}`));

    const depts = await Department.find({}, 'username name panelType password').lean();
    console.log('\n--- ALL DEPARTMENTS ---');
    depts.forEach(d => console.log(`User: ${d.username}, Name: ${d.name}, Panel: ${d.panelType}, Pwd: ${d.password}`));

    process.exit();
}
run();
