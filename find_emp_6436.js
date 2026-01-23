require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');
const connectDB = require('./server/config/db');

async function findEmp() {
    await connectDB();
    const emp = await Employee.findOne({ employeeId: 'EMP-6436' });
    if (emp) {
        console.log(`FOUND: "${emp.employeeId}" | Pwd: "${emp.password}" | Role: ${emp.isOrgAdmin ? 'OrgAdmin' : 'Employee'}`);
    } else {
        console.log('EMP-6436 not found');
    }
    mongoose.disconnect();
}
findEmp().catch(console.error);
