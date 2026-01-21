const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function deepDiag() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.db.collection('students');

        const all = await collection.find({}).toArray();
        let report = `Total Students: ${all.length}\n\n`;

        all.forEach(s => {
            report += `--- Student ---\n`;
            report += `_id: ${s._id}\n`;
            report += `name: ${s.studentName}\n`;
            report += `sid: ${JSON.stringify(s.studentId)}\n`;
            report += `user: ${JSON.stringify(s.username)}\n`;
            report += `mail: ${JSON.stringify(s.email)}\n`;
            report += `org: ${s.organizationId}\n\n`;
        });

        fs.writeFileSync('deep_diag.txt', report);
        console.log('Done');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

deepDiag();
