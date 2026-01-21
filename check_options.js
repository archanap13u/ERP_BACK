const mongoose = require('mongoose');
require('dotenv').config();

async function checkIndexOptions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.db.collection('students');
        const indexes = await collection.listIndexes().toArray();

        const sidIndex = indexes.find(idx => idx.name.includes('studentId'));
        if (sidIndex) {
            console.log('--- studentId Index Options ---');
            console.log(JSON.stringify(sidIndex, null, 2));
        } else {
            console.log('studentId index NOT FOUND!');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkIndexOptions();
