const mongoose = require('mongoose');
require('dotenv').config();

async function scan() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erpnext');
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('--- DB SCAN ---');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            if (count > 0 && col.name.toLowerCase().includes('center')) {
                console.log(`Collection ${col.name}: ${count} docs`);
                const samples = await db.collection(col.name).find({}).limit(1).toArray();
                console.log('Sample Keys:', Object.keys(samples[0]));
            }
        }
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}
scan();
