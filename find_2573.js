require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');
const Department = require('./server/models/Department');
const connectDB = require('./server/config/db');

async function run() {
    await connectDB();
    const e = await Employee.findOne({ $or: [{ employeeId: 'EMP-2573' }, { username: 'EMP-2573' }] }).lean();
    console.log('Employee:', e);
    const d = await Department.findOne({ username: 'EMP-2573' }).lean();
    console.log('Department:', d);
    process.exit();
}
run();
