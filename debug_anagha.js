const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erpnext');
        const db = mongoose.connection.db;
        const employees = db.collection('employees');
        const emp = await employees.findOne({ employeeName: /Anagha/i });
        console.log('--- ANAGHA TARGETED RECORD ---');
        if (emp) {
            console.log('ID:', emp._id);
            console.log('EmployeeName:', emp.employeeName);
            console.log('EmployeeId:', emp.employeeId);
            console.log('Designation:', emp.designation);
            console.log('Email:', emp.email);
            console.log('OrgId:', emp.organizationId);
            console.log('DeptId:', emp.departmentId);
        } else {
            console.log('No employee found with name matching Anagha');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
