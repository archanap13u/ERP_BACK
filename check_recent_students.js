const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('./server/models/Student');

async function checkStudents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const students = await Student.find().sort({ createdAt: -1 }).limit(5);
        console.log('Recent 5 Students:');
        students.forEach(s => {
            console.log(`- Name: ${s.studentName}, Email: ${s.email}, Status: ${s.verificationStatus}, OrgId: ${s.organizationId}`);
        });

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkStudents();
