require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./server/models/Student');
const connectDB = require('./server/config/db');

async function list() {
    await connectDB();
    const students = await Student.find({}).limit(10);
    console.log(`Found ${students.length} students.`);
    students.forEach(s => {
        console.log(`- ${s.studentName} (ID: ${s._id}, Org: ${s.organizationId}, Status: ${s.verificationStatus})`);
    });
    mongoose.disconnect();
}

list().catch(console.error);
