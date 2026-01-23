require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./server/models/Student');
const connectDB = require('./server/config/db');

async function check() {
    await connectDB();
    console.log('--- Checking for "undefined" studentId ---');
    const students = await Student.find({ studentId: "undefined" }).lean();
    console.log(`Found ${students.length} students with studentId: "undefined"`);
    if (students.length > 0) {
        students.forEach(s => {
            console.log(`- ${s.studentName} (ID: ${s._id}, Org: ${s.organizationId})`);
        });
    }

    console.log('\n--- Checking for empty string studentId ---');
    const emptyStudents = await Student.find({ studentId: "" }).lean();
    console.log(`Found ${emptyStudents.length} students with studentId: ""`);

    console.log('\n--- Checking for null studentId ---');
    const nullStudents = await Student.find({ studentId: null }).lean();
    console.log(`Found ${nullStudents.length} students with studentId: null`);

    mongoose.disconnect();
}

check().catch(console.error);
