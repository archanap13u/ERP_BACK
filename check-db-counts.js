const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const fs = require('fs');

async function run() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    const stats = {
        collections: collections.map(c => c.name),
        counts: {}
    };

    for (const coll of stats.collections) {
        const count = await db.collection(coll).countDocuments();
        stats.counts[coll] = count;
    }

    fs.writeFileSync('db-stats.json', JSON.stringify(stats, null, 2));
    console.log('Stats written to db-stats.json');
    await mongoose.disconnect();
}

run().catch(console.error);
