const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collections = ['departments', 'employees', 'organizations', 'studycenters'];
        const usernameMap = {}; // username -> [{ collection, id, name }]

        for (const collName of collections) {
            const docs = await mongoose.connection.db.collection(collName).find({
                username: { $exists: true, $ne: '' }
            }).toArray();

            for (const doc of docs) {
                const uname = doc.username.trim().toLowerCase();
                if (!usernameMap[uname]) {
                    usernameMap[uname] = [];
                }
                usernameMap[uname].push({
                    collection: collName,
                    id: doc._id,
                    name: doc.name || doc.employeeName || doc.centerName || doc.fullName || 'Unknown'
                });
            }
        }

        console.log('\n--- Duplicate Analysis ---');
        let duplicatesFound = false;
        for (const [uname, occurrences] of Object.entries(usernameMap)) {
            if (occurrences.length > 1) {
                duplicatesFound = true;
                const occStr = occurrences.map(occ => `[${occ.collection}]`).join(', ');
                console.log(`DUP: "${uname}" -> ${occStr}`);
            }
        }

        if (!duplicatesFound) {
            console.log('No duplicate usernames found across surveyed collections.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
