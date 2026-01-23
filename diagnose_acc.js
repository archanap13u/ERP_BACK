require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');
const Department = require('./server/models/Department');
const connectDB = require('./server/config/db');

async function diagnose(identifier) {
    await connectDB();
    const id = identifier.trim();
    console.log(`--- Diagnostic for: "${id}" ---`);

    const emps = await Employee.find({
        $or: [
            { username: { $regex: new RegExp(`^${id}$`, 'i') } },
            { employeeId: { $regex: new RegExp(`^${id}$`, 'i') } }
        ]
    }).lean();

    console.log(`Employees found: ${emps.length}`);
    emps.forEach(e => {
        console.log(`  - Name: "${e.employeeName}", ID: "${e.employeeId}", User: "${e.username}", Pwd: "${e.password}"`);
    });

    const depts = await Department.find({
        username: { $regex: new RegExp(`^${id}$`, 'i') }
    }).lean();

    console.log(`Departments found: ${depts.length}`);
    depts.forEach(d => {
        console.log(`  - Name: "${d.name}", User: "${d.username}", Pwd: "${d.password}", Panel: "${d.panelType}"`);
    });

    mongoose.disconnect();
}

const target = process.argv[2] || 'EMP-2573';
diagnose(target).catch(console.error);
