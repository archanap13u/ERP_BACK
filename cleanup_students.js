require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./server/models/Student');
const connectDB = require('./server/config/db');

async function cleanup() {
    await connectDB();
    console.log('--- Student Data Cleanup ---');

    // Find students with "undefined" strings
    const students = await Student.find({
        $or: [
            { studentId: "undefined" },
            { username: "undefined" }
        ]
    });

    console.log(`Found ${students.length} corrupted student records.`);

    for (const student of students) {
        let updated = false;
        if (student.studentId === "undefined") {
            student.studentId = undefined; // Setting to real undefined removes field usually, or null
            updated = true;
        }
        if (student.username === "undefined") {
            student.username = undefined;
            updated = true;
        }

        if (updated) {
            await student.save();
            console.log(`Fixed student: ${student.studentName} (${student._id})`);
        }
    }

    console.log('Cleanup complete.');
    mongoose.disconnect();
}

cleanup().catch(err => {
    console.error(err);
    process.exit(1);
});
