require('dotenv').config();
const mongoose = require('mongoose');
const { models } = require('./server/models');
const connectDB = require('./server/config/db');

async function exhaustiveScan(identifier) {
    await connectDB();
    console.log(`--- Exhaustive Scan for: "${identifier}" ---`);

    for (const [name, Model] of Object.entries(models)) {
        try {
            const query = {
                $or: [
                    { username: { $regex: new RegExp(`^${identifier}$`, 'i') } },
                    { email: { $regex: new RegExp(`^${identifier}$`, 'i') } },
                    { employeeId: { $regex: new RegExp(`^${identifier}$`, 'i') } }
                ]
            };
            const results = await Model.find(query).lean();
            if (results.length > 0) {
                console.log(`[Collection: ${name}] Found ${results.length} match(es):`);
                results.forEach(r => {
                    console.log(`  - _id: ${r._id}, Name: ${r.employeeName || r.name || r.fullName || r.centerName}, Role Field: ${r.role}, PanelType: ${r.panelType}`);
                });
            }
        } catch (e) {
            // Some models might not have these fields, skip errors
        }
    }

    mongoose.disconnect();
}

const id = process.argv[2] || 'EMP-2573';
exhaustiveScan(id).catch(console.error);
