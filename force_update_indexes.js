const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function checkAndDropIndexes() {
    let logStr = '';
    const log = (m) => { console.log(m); logStr += m + '\n'; };

    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found');

        await mongoose.connect(uri);
        log('Connected to Atlas');

        const collection = mongoose.connection.db.collection('students');

        const indexes = await collection.listIndexes().toArray();
        log('Current Indexes: ' + JSON.stringify(indexes, null, 2));

        for (const idx of indexes) {
            if (idx.name !== '_id_') {
                log(`Dropping index: ${idx.name}`);
                try {
                    await collection.dropIndex(idx.name);
                } catch (de) {
                    log(`Failed to drop ${idx.name}: ${de.message}`);
                }
            }
        }

        const StudentSchema = require('./server/models/Student');
        // Mongoose might have exports as the model or an object with schema
        const modelDef = StudentSchema.schema || StudentSchema;

        const RealStudent = mongoose.models.Student || mongoose.model('Student', modelDef);

        log('Syncing indexes...');
        await RealStudent.syncIndexes();

        const finalIndexes = await collection.listIndexes().toArray();
        log('Final Indexes: ' + JSON.stringify(finalIndexes, null, 2));

        fs.writeFileSync('force_update_detailed.txt', logStr);
        process.exit(0);
    } catch (e) {
        log('ERROR: ' + e.message + '\n' + e.stack);
        fs.writeFileSync('force_update_detailed.txt', logStr);
        process.exit(1);
    }
}

checkAndDropIndexes();
