const mongoose = require('mongoose');
const { models } = require('./server/models');
const connectDB = require('./server/config/db');
require('dotenv').config();

const migrate = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        const doctypes = ['announcement', 'opsannouncement'];

        for (const doctype of doctypes) {
            console.log(`Migrating ${doctype}...`);
            const items = await models[doctype].find({});
            let migratedCount = 0;

            for (const item of items) {
                // If targetStudyCenter is empty/null but targetCenter has a value, migrate it
                if (!item.targetStudyCenter && item.targetCenter) {
                    item.targetStudyCenter = item.targetCenter;
                    // Also clear the old field if needed, but keeping it for safety for now
                    // item.targetCenter = undefined; 
                    await item.save();
                    migratedCount++;
                }
            }
            console.log(`Migrated ${migratedCount} ${doctype} records.`);
        }

        console.log('All migrations completed.');
    } catch (e) {
        console.error(e);
    }
    process.exit();
};

migrate();
