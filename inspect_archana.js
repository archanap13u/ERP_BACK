const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.db.collection('students');
        const s = await collection.findOne({ studentName: 'archana' });

        let report = `Student: archana\n`;
        report += `studentId: ${JSON.stringify(s.studentId)}\n`;
        report += `username: ${JSON.stringify(s.username)}\n`;
        report += `email: ${JSON.stringify(s.email)}\n`;

        fs.writeFileSync('inspect_archana.txt', report);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

inspect();
