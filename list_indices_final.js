const mongoose = require('mongoose');
require('dotenv').config();

async function listIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.db.collection('students');
        const indexes = await collection.listIndexes().toArray();
        console.log(JSON.stringify(indexes, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listIndexes();
