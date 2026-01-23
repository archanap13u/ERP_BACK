require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./server/models/Student');
const connectDB = require('./server/config/db');

async function inspect() {
    await connectDB();
    const studentId = '67907f23f39185ea9367e923';
    const student = await Student.findById(studentId).lean();

    if (student) {
        console.log('Student Found:', student.studentName);
        console.log('OrgId:', student.organizationId);
        console.log('OrgId Type:', typeof student.organizationId);
        console.log('OrgId Constructor:', student.organizationId.constructor.name);
    } else {
        console.log('Student NOT found by ID');
    }

    mongoose.disconnect();
}

inspect().catch(console.error);
