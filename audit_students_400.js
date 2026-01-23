require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./server/models/Student');
const connectDB = require('./server/config/db');

async function audit() {
    await connectDB();
    console.log('--- Student Audit ---');

    // Find students with Pending/Processing status
    const students = await Student.find({
        verificationStatus: { $in: ['Pending', 'Processing'] }
    });

    console.log(`Found ${students.length} students awaiting verification.`);

    for (const student of students) {
        console.log(`\nStudent: ${student.studentName} (${student._id})`);
        console.log(`- OrgId: ${student.organizationId}`);
        console.log(`- StudentId: "${student.studentId}"`);
        console.log(`- Email: "${student.email}"`);
        console.log(`- Username: "${student.username}"`);

        // Check if any unique fields would conflict if we saved (not that status update should, but just in case)
        if (student.email) {
            const conflict = await Student.findOne({
                organizationId: student.organizationId,
                email: student.email,
                _id: { $ne: student._id }
            });
            if (conflict) console.warn(`  [!] Email conflict with ${conflict._id}`);
        }

        if (student.studentId) {
            const conflict = await Student.findOne({
                organizationId: student.organizationId,
                studentId: student.studentId,
                _id: { $ne: student._id }
            });
            if (conflict) console.warn(`  [!] StudentId conflict with ${conflict._id}`);
        }
    }

    mongoose.disconnect();
}

audit().catch(err => {
    console.error(err);
    process.exit(1);
});
