const mongoose = require('mongoose');
const { models } = require('./server/models');

async function checkStudents() {
    try {
        await mongoose.connect('mongodb://localhost:27017/erpnext');
        console.log('Connected to MongoDB');

        const students = await models.student.find({});
        console.log(`Total Students: ${students.length}`);

        console.log('\n--- Student ID and Username Check ---');
        students.forEach(s => {
            console.log(`- Name: ${s.studentName} | ID: "${s.studentId}" | User: "${s.username}" | Email: "${s.email}" | Center: "${s.studyCenter}" | Org: ${s.organizationId}`);
        });

        // Check for empty string collisions
        const emptyIds = students.filter(s => s.studentId === "");
        const emptyUsers = students.filter(s => s.username === "");
        console.log(`\nStudents with empty studentId: ${emptyIds.length}`);
        console.log(`Students with empty username: ${emptyUsers.length}`);

        // Cleanup: remove empty string studentId/username/email to allow partial unique index
        if (emptyIds.length > 0 || emptyUsers.length > 0 || students.some(s => s.email === "")) {
            console.log('\nPerforming cleanup: Converting empty string IDs/Usernames/Emails to undefined...');
            const idRes = await models.student.updateMany({ studentId: "" }, { $unset: { studentId: "" } });
            const userRes = await models.student.updateMany({ username: "" }, { $unset: { username: "" } });
            const emailRes = await models.student.updateMany({ email: "" }, { $unset: { email: "" } });
            console.log(`- Cleared empty IDs: ${idRes.modifiedCount}`);
            console.log(`- Cleared empty Usernames: ${userRes.modifiedCount}`);
            console.log(`- Cleared empty Emails: ${emailRes.modifiedCount}`);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkStudents();
