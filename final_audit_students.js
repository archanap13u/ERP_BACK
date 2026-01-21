const mongoose = require('mongoose');
require('dotenv').config();

async function finalAudit() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.db.collection('students');
        const s = await collection.findOne({ studentName: 'archana' });

        console.log('--- ARCHANA FULL RECORD ---');
        console.log(JSON.stringify(s, null, 2));

        // Let's also check if there are OTHER students with DIFFERENT Names
        const others = await collection.find({ studentName: { $ne: 'archana' } }).toArray();
        console.log(`\n--- Other Students (${others.length}) ---`);
        others.forEach(o => {
            console.log(`- ${o.studentName} | sid: ${JSON.stringify(o.studentId)} | org: ${o.organizationId}`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

finalAudit();
