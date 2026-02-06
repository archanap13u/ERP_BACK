const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const collection = db.collection('students');

        console.log('Checking indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        const indexName = 'organizationId_1_username_1';
        const indexExists = indexes.some(idx => idx.name === indexName);

        if (indexExists) {
            console.log(`Dropping index: ${indexName}`);
            await collection.dropIndex(indexName);
            console.log('Index dropped successfully.');
        } else {
            console.log(`Index ${indexName} does not exist.`);
        }

        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

run();
