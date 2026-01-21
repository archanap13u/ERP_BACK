const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        console.log('Searching for study centers with username "iits"...');
        const docs = await db.collection('studycenters').find({ username: 'iits' }).toArray();

        for (const doc of docs) {
            const newUsername = 'iits_center';
            console.log(`Renaming StudyCenter "${doc.centerName || 'Unknown'}" (ID: ${doc._id}) username from "iits" to "${newUsername}"`);
            await db.collection('studycenters').updateOne({ _id: doc._id }, { $set: { username: newUsername } });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
