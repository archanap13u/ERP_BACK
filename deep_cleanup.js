const mongoose = require('mongoose');
require('dotenv').config();

async function deepCleanup() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        const collection = mongoose.connection.db.collection('students');

        const all = await collection.find({}).toArray();
        console.log(`Found ${all.length} students`);

        const badValues = ["", "undefined", "null", "undefined ", "null "];
        let cleaned = 0;

        for (const s of all) {
            let needsCleaning = false;
            let update = {};

            if (s.studentId === null || badValues.includes(String(s.studentId).trim())) {
                update.studentId = "";
                needsCleaning = true;
            }
            if (s.username === null || badValues.includes(String(s.username).trim())) {
                update.username = "";
                needsCleaning = true;
            }
            if (s.email === null || badValues.includes(String(s.email).trim())) {
                update.email = "";
                needsCleaning = true;
            }

            if (needsCleaning) {
                await collection.updateOne({ _id: s._id }, { $unset: update });
                cleaned++;
            }
        }
        console.log(`Deep cleaned ${cleaned} records.`);

        // Also check if multiple people have the EXACT SAME studentId
        const groups = await collection.aggregate([
            { $match: { studentId: { $exists: true, $ne: null, $ne: "" } } },
            { $group: { _id: { org: "$organizationId", sid: "$studentId" }, count: { $sum: 1 }, names: { $push: "$studentName" } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();

        console.log('Duplicated IDs:', JSON.stringify(groups, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

deepCleanup();
