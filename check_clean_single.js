const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function checkSingleStudent() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.db.collection('students');
        const students = await collection.find({}).toArray();

        let report = `Total students: ${students.length}\n`;

        for (const s of students) {
            report += `Student: ${s.studentName}\n`;
            report += `  _id: ${s._id}\n`;
            report += `  studentId: "${s.studentId}" (${typeof s.studentId})\n`;
            report += `  username: "${s.username}" (${typeof s.username})\n`;
            report += `  email: "${s.email}" (${typeof s.email})\n`;
            report += `  organizationId: ${s.organizationId}\n`;

            // If it's bad, CLEAN IT
            let update = {};
            if (s.studentId === "undefined" || s.studentId === "" || s.studentId === null) update.studentId = "";
            if (s.username === "undefined" || s.username === "" || s.username === null) update.username = "";
            if (s.email === "undefined" || s.email === "" || s.email === null) update.email = "";

            if (Object.keys(update).length > 0) {
                await collection.updateOne({ _id: s._id }, { $unset: update });
                report += `  -> CLEANED bad fields\n`;
            }
        }

        fs.writeFileSync('single_student_report.txt', report);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSingleStudent();
