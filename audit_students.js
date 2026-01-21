const mongoose = require('mongoose');
require('dotenv').config();

async function auditStudents() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        const collection = mongoose.connection.db.collection('students');

        const students = await collection.find({}).toArray();
        console.log(`Total students: ${students.length}`);

        const idMap = {};
        students.forEach(s => {
            const sid = s.studentId;
            const key = `${s.organizationId || 'NO_ORG'}_${sid}`;
            if (!idMap[key]) idMap[key] = [];
            idMap[key].push({ name: s.studentName, id: s._id, sid: sid, type: typeof sid });
        });

        console.log('\n--- Duplicate Groups (Org + studentId) ---');
        for (const [key, docs] of Object.entries(idMap)) {
            if (docs.length > 1) {
                console.log(`Key: ${key} | Count: ${docs.length}`);
                docs.forEach(d => console.log(`  - ${d.name} (_id: ${d.id}, sid: "${d.sid}", type: ${d.type})`));
            }
        }

        console.log('\n--- Frequency of studentId values ---');
        const freq = {};
        students.forEach(s => {
            const sid = String(s.studentId);
            freq[sid] = (freq[sid] || 0) + 1;
        });
        console.log(JSON.stringify(freq, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

auditStudents();
