const mongoose = require('mongoose');
require('dotenv').config();
const { models } = require('./server/models');

async function checkIsolation() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erpnext');
        console.log('Connected to DB');

        const modelEntries = Object.entries(models);

        for (const [modelName, Model] of modelEntries) {
            // Skip core/global models
            if (['organization', 'user', 'superadmin', 'platformsettings'].includes(modelName)) continue;

            const total = await Model.countDocuments();
            if (total === 0) continue;

            const orphanCount = await Model.countDocuments({
                $or: [
                    { organizationId: { $exists: false } },
                    { organizationId: null },
                    { organizationId: "" },
                    { organizationId: "null" },
                    { organizationId: "undefined" }
                ]
            });

            if (orphanCount > 0) {
                console.warn(`[ISOLATION ALERT] Model ${modelName}: ${orphanCount} / ${total} records are MISSING or have INVALID organizationId!`);
            } else {
                console.log(`Model ${modelName}: All ${total} records have valid organizationId.`);
            }
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkIsolation();
