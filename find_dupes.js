const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function findStudentDuplicates() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        const uri = process.env.MONGODB_URI || 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';
        await mongoose.connect(uri);
        log('Connected to MongoDB Atlas');
        const collection = mongoose.connection.db.collection('students');

        const pipeline = [
            {
                $group: {
                    _id: { org: '$organizationId', sid: '$studentId' },
                    count: { $sum: 1 },
                    docs: { $push: { id: '$_id', name: '$studentName' } }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ];

        const duplicates = await collection.aggregate(pipeline).toArray();
        log('--- DUPLICATE GROUPS FOUND ---');
        log(JSON.stringify(duplicates, null, 2));

        const badValues = ["", "undefined", "null", "undefined ", "null ", null];
        const allStudents = await collection.find({}).toArray();
        const badOnes = allStudents.filter(s => {
            const val = String(s.studentId).trim();
            return badValues.includes(val) || badValues.includes(s.studentId);
        });

        log(`\n--- Records with bad studentId (${badOnes.length}) ---`);
        for (const b of badOnes) {
            log(`Student: ${b.studentName} | studentId: "${b.studentId}"`);
            // FORCE CLEANUP
            await collection.updateOne({ _id: b._id }, { $unset: { studentId: "" } });
        }
        log(`\nCleaned up ${badOnes.length} bad studentIds.`);

        fs.writeFileSync('find_dupes_final.txt', output);
        process.exit(0);
    } catch (e) {
        log('ERROR: ' + e.message);
        fs.writeFileSync('find_dupes_final.txt', output);
        process.exit(1);
    }
}

findStudentDuplicates();
