require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');
const connectDB = require('./server/config/db');

async function check() {
    await connectDB();
    const emps = await Employee.find({ $or: [{ username: '' }, { username: null }] }).lean();
    console.log('--- Empty Username Employees ---');
    console.log(JSON.stringify(emps, null, 2));
    mongoose.disconnect();
}
check().catch(console.error);
