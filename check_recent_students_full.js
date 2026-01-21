const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('./server/models/Student');

async function checkStudents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const students = await Student.find().sort({ createdAt: -1 }).limit(1);
        console.log('Recent Student Full Object:');
        console.log(JSON.stringify(students, null, 2));

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkStudents();
